// services/moodleService.ts
// Moodle REST API integration - each school has its own Moodle instance
// User provides: Moodle URL (e.g. https://virtual.colegio.edu.co) + API token

export interface MoodleSiteInfo {
  sitename: string;
  userid: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname: string;
  visible: number;
}

export interface MoodleAssignment {
  id: number;
  cmid: number;
  course: number;
  name: string;
  intro: string;
  duedate: number; // Unix timestamp, 0 if none
  allowsubmissionsfromdate: number;
  grade: number;
  timemodified: number;
  coursemodule: number;
}

export interface MoodleAssignmentWithCourse extends MoodleAssignment {
  courseName: string;
  courseShortname: string;
}

/**
 * Call Moodle REST API
 * Base: https://moodle-site/webservice/rest/server.php
 */
async function moodleApiCall<T>(
  baseUrl: string,
  token: string,
  wsfunction: string,
  extraParams: Record<string, string | number | number[]> = {}
): Promise<T> {
  const url = baseUrl.replace(/\/$/, '') + '/webservice/rest/server.php';
  const params = new URLSearchParams({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: 'json',
  });

  for (const [k, v] of Object.entries(extraParams)) {
    if (Array.isArray(v)) {
      v.forEach((val, i) => params.append(`${k}[${i}]`, String(val)));
    } else {
      params.append(k, String(v));
    }
  }

  const response = await fetch(url + '?' + params.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Moodle API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Moodle returns exception object on error
  if (data.exception) {
    throw new Error(data.message || data.exception);
  }

  return data as T;
}

/**
 * Get site info and verify token - returns current user id
 */
export async function getMoodleSiteInfo(baseUrl: string, token: string): Promise<MoodleSiteInfo> {
  return moodleApiCall<MoodleSiteInfo>(baseUrl, token, 'core_webservice_get_site_info');
}

/**
 * Get courses the user is enrolled in
 */
export async function getMoodleUserCourses(baseUrl: string, token: string, userId: number): Promise<MoodleCourse[]> {
  const courses = await moodleApiCall<MoodleCourse[]>(baseUrl, token, 'core_enrol_get_users_courses', {
    userid: userId,
  });
  return Array.isArray(courses) ? courses.filter((c) => c.visible === 1) : [];
}

/**
 * Get assignments for given course IDs
 * Response: { courses: [{ id, shortname, fullname, assignments: [...] }] }
 */
async function getMoodleAssignmentsRaw(
  baseUrl: string,
  token: string,
  courseIds: number[]
): Promise<{ courses: Array<{ id: number; shortname: string; fullname: string; assignments: MoodleAssignment[] }> }> {
  if (courseIds.length === 0) return { courses: [] };

  return moodleApiCall<any>(baseUrl, token, 'mod_assign_get_assignments', {
    courseids: courseIds,
  });
}

/**
 * Fetch all assignments for a Moodle user (full flow)
 */
export async function fetchAllMoodleAssignments(
  baseUrl: string,
  token: string
): Promise<MoodleAssignmentWithCourse[]> {
  const siteInfo = await getMoodleSiteInfo(baseUrl, token);
  const courses = await getMoodleUserCourses(baseUrl, token, siteInfo.userid);
  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);
  const courseMap = new Map(courses.map((c) => [c.id, { shortname: c.shortname, fullname: c.fullname }]));

  const result = await getMoodleAssignmentsRaw(baseUrl, token, courseIds);
  const all: MoodleAssignmentWithCourse[] = [];

  if (result?.courses) {
    for (const course of result.courses) {
      const meta = courseMap.get(course.id) || { shortname: course.shortname || '', fullname: course.fullname || '' };
      for (const a of course.assignments || []) {
        all.push({
          ...a,
          courseName: meta.fullname,
          courseShortname: meta.shortname,
        });
      }
    }
  }

  return all;
}

/**
 * Get token via login (alternative to admin-created token)
 * Some Moodles allow: /login/token.php?username=X&password=Y&service=moodle_mobile_app
 */
export async function getMoodleTokenFromLogin(
  baseUrl: string,
  username: string,
  password: string,
  service: string = 'moodle_mobile_app'
): Promise<string> {
  const url = baseUrl.replace(/\/$/, '') + '/login/token.php';
  const params = new URLSearchParams({ username, password, service });
  const response = await fetch(url + '?' + params.toString());
  const data = await response.json();

  if (data.token) return data.token;
  throw new Error(data.error || 'No se pudo obtener el token de Moodle');
}
