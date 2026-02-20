CREATE OR REPLACE FUNCTION delete_student_completely(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges
AS $$
BEGIN
  -- 1. Delete detailed progress & gamification data
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_pets') THEN
    DELETE FROM public.student_pets WHERE student_id = target_user_id;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'players_presence') THEN
    DELETE FROM public.players_presence WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'learning_progress') THEN
    DELETE FROM public.learning_progress WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quest_completions') THEN
    DELETE FROM public.quest_completions WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_quest_progress') THEN
    DELETE FROM public.user_quest_progress WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'economy') THEN
    DELETE FROM public.economy WHERE user_id = target_user_id;
  END IF;
  
  -- 2. Delete Academic & Reporting data
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lesson_progress') THEN
    DELETE FROM public.lesson_progress WHERE student_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'academic_results') THEN
    DELETE FROM public.academic_results WHERE student_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tutor_reports') THEN
    DELETE FROM public.tutor_reports WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'infractions') THEN
    DELETE FROM public.infractions WHERE student_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'teacher_reports') THEN
    DELETE FROM public.teacher_reports WHERE student_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_teacher_assignments') THEN
    DELETE FROM public.student_teacher_assignments WHERE student_id = target_user_id;
  END IF;
  
  -- 3. Delete Research System data
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'research_sources') THEN
    DELETE FROM public.research_sources WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'research_sessions') THEN
    DELETE FROM public.research_sessions WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'plagiarism_checks') THEN
    DELETE FROM public.plagiarism_checks WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'paraphrasing_history') THEN
    DELETE FROM public.paraphrasing_history WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'research_projects') THEN
    DELETE FROM public.research_projects WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'research_reports') THEN
    DELETE FROM public.research_reports WHERE user_id = target_user_id;
  END IF;
  
  -- 4. Delete Parent/Mission dependencies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'parent_missions') THEN
    DELETE FROM public.parent_missions WHERE student_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'homework_submissions') THEN
    DELETE FROM public.homework_submissions WHERE student_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    DELETE FROM public.messages WHERE sender_id = target_user_id OR receiver_id = target_user_id;
  END IF;
  
  -- 5. Delete Curriculum & Google Classroom sync data
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_curriculum_plans') THEN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'curriculum_topics') THEN
      DELETE FROM public.curriculum_topics WHERE plan_id IN (SELECT id FROM public.student_curriculum_plans WHERE student_id = target_user_id);
    END IF;
    DELETE FROM public.student_curriculum_plans WHERE student_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'google_classroom_assignments') THEN
    DELETE FROM public.google_classroom_assignments WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'google_classroom_courses') THEN
    DELETE FROM public.google_classroom_courses WHERE user_id = target_user_id;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'google_classroom_tokens') THEN
    DELETE FROM public.google_classroom_tokens WHERE user_id = target_user_id;
  END IF;
  
  -- 6. Finally, delete the profile
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- 7. CRITICAL: Delete the Auth User to release the email address
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error deleting student: %', SQLERRM;
  RETURN FALSE;
END;
$$;

-- Grant permissions to make it callable from the frontend
GRANT EXECUTE ON FUNCTION delete_student_completely TO authenticated;
GRANT EXECUTE ON FUNCTION delete_student_completely TO service_role;
