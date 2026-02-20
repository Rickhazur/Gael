import React, { useState } from 'react';
import type { Language, Grade, SourceInfo } from '../../types/research';
import { BookOpen, Link2, Calendar, CheckCircle2, Plus, Trash2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CitationHelperProps {
  grade: Grade;
  language: Language;
  sources: SourceInfo[];
  onAddSource: (source: SourceInfo) => void;
  onRemoveSource: (index: number) => void;
  onInsertCitation: (citation: string) => void;
}

const citationGuide = {
  es: {
    '1': {
      type: 'El Árbol de los Gracias',
      example: '"Gracias al libro de los Leones..."',
      listExample: 'Mis Ayudantes: {title}',
      tip: 'Solo di de dónde sacaste la información. ¡Da las gracias!',
      fields: ['title'],
    },
    '2': {
      type: 'El Árbol de los Gracias',
      example: '"Saqué la información de..."',
      listExample: 'Gracias a: {title} ({source})',
      tip: 'Menciona si fue un libro o internet. Es dar crédito a tu ayudante.',
      fields: ['title', 'source'],
    },
    '3': {
      type: 'La Identidad del Libro',
      example: '"Libro: El Sistema Solar por Juan Pérez"',
      listExample: '- {title} por {source}',
      tip: 'Busca el Título y el Autor en la portada.',
      fields: ['title', 'source'],
    },
    '4': {
      type: 'El Registro del Detective',
      example: '"Planetas Rocosos, Pérez J. (2021)"',
      listExample: '- {source} ({date}). {title}. {url}',
      tip: 'Incluye Autor, Año y Tipo. ¡Como un detective!',
      fields: ['title', 'source', 'url', 'date'],
    },
    '5': {
      type: 'Formato Pre-Profesional (APA Simple)',
      example: '"(Pérez, 2021)"',
      listExample: '- {source}. ({date}). {title}. Recuperado de {url}',
      tip: 'Usa formato formal. Diferencia tus ideas de las de otros.',
      fields: ['title', 'source', 'url', 'date'],
    },
  },
  en: {
    '1': {
      type: 'The Gratitude Tree',
      example: '"Thanks to the Lion book..."',
      listExample: 'My Helpers: {title}',
      tip: 'Just say where you got the info. Say thanks!',
      fields: ['title'],
    },
    '2': {
      type: 'The Gratitude Tree',
      example: '"I got this info from..."',
      listExample: 'Thanks to: {title} ({source})',
      tip: 'Mention if it was a book or internet. Give credit!',
      fields: ['title', 'source'],
    },
    '3': {
      type: 'Book Identity',
      example: '"Book: Solar System by John Doe"',
      listExample: '- {title} by {source}',
      tip: 'Find the Title and Author on the cover.',
      fields: ['title', 'source'],
    },
    '4': {
      type: 'Detective Log',
      example: '"Rocky Planets, Doe J. (2021)"',
      listExample: '- {source} ({date}). {title}. {url}',
      tip: 'Include Author, Year, and Type. Like a detective!',
      fields: ['title', 'source', 'url', 'date'],
    },
    '5': {
      type: 'Pre-Professional (Simple APA)',
      example: '"(Doe, 2021)"',
      listExample: '- {source}. ({date}). {title}. Retrieved from {url}',
      tip: 'Use formal format. Distinguish your ideas from others.',
      fields: ['title', 'source', 'url', 'date'],
    },
  },
};

const inTextPhrases = {
  es: {
    '1': ['Gracias al libro...', 'Mi papá me contó que...', 'La biblioteca me enseñó...'],
    '2': ['Saqué esto de...', 'Aprendí en un video que...', 'Gracias a la página...'],
    '3': ['Libro: {title}...', 'Autor: {source}...', 'Según {title}...'],
    '4': ['Según {source} ({date})...', 'En el texto {title}...', 'Como dice {source}...'],
    '5': ['(Apellido, {date})...', 'Según {source} ({date})...', 'Referencia: {title}...'],
  },
  en: {
    '1': ['Thanks to the book...', 'My dad told me...', 'The library taught me...'],
    '2': ['I got this from...', 'I learned in a video...', 'Thanks to the website...'],
    '3': ['Book: {title}...', 'Author: {source}...', 'According to {title}...'],
    '4': ['According to {source} ({date})...', 'In the text {title}...', 'As {source} says...'],
    '5': ['(Lastname, {date})...', 'According to {source} ({date})...', 'Reference: {title}...'],
  },
};

export function CitationHelper({
  grade,
  language,
  sources,
  onAddSource,
  onRemoveSource,
  onInsertCitation
}: CitationHelperProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState<Partial<SourceInfo>>({
    title: '',
    source: '',
    url: '',
    date: new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US'),
  });

  const guide = citationGuide[language][grade];
  const phrases = inTextPhrases[language][grade];
  const today = new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');

  const handleAddSource = () => {
    if (newSource.title) {
      onAddSource({
        title: newSource.title || '',
        source: newSource.source || '',
        url: newSource.url || '',
        date: newSource.date || today,
      });
      setNewSource({ title: '', source: '', url: '', date: today });
      setShowAddForm(false);
    }
  };

  const generateInTextCitation = (source: SourceInfo, phraseIndex: number) => {
    let phrase = phrases[phraseIndex % phrases.length];
    phrase = phrase.replace('{source}', source.source || source.title);
    phrase = phrase.replace('{url}', source.url || '');
    phrase = phrase.replace('{date}', source.date);
    phrase = phrase.replace('{quote}', '...');
    return phrase;
  };

  const generateListCitation = (source: SourceInfo) => {
    let citation = guide.listExample;
    citation = citation.replace('{source}', source.source || source.title);
    citation = citation.replace('{url}', source.url || '');
    citation = citation.replace('{date}', source.date);
    return citation;
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-fredoka font-semibold text-foreground">
            {language === 'es' ? '📚 Aprende a Citar' : '📚 Learn to Cite'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {language === 'es' ? `Grado ${grade}° - ${guide.type}` : `Grade ${grade} - ${guide.type}`}
          </p>
        </div>
      </div>

      {/* Teaching Section */}
      <div className="bg-accent/10 rounded-xl p-4 border-l-4 border-accent">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {language === 'es' ? '¿Cómo citar en tu grado?' : 'How to cite in your grade?'}
            </p>
            <p className="text-xs text-muted-foreground mb-2">{guide.tip}</p>
            <div className="bg-background/50 rounded-lg p-2 text-sm italic text-foreground">
              {guide.example.replace('{date}', today)}
            </div>
          </div>
        </div>
      </div>

      {/* Phrase Starters for Citations */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language === 'es' ? 'Frases para citar en tu texto:' : 'Phrases to cite in your text:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {phrases.map((phrase, i) => (
            <button
              key={i}
              onClick={() => onInsertCitation(phrase.replace('{source}', '...').replace('{url}', '').replace('{date}', today).replace('{quote}', '...'))}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
            >
              {phrase.split('{')[0]}...
            </button>
          ))}
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {language === 'es' ? 'Mis Fuentes:' : 'My Sources:'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3 h-3" />
            {language === 'es' ? 'Agregar' : 'Add'}
          </button>
        </div>

        {sources.length === 0 && !showAddForm && (
          <p className="text-xs text-muted-foreground italic py-2">
            {language === 'es'
              ? 'Agrega las fuentes que usaste para tu reporte.'
              : 'Add the sources you used for your report.'}
          </p>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-muted/30 rounded-xl p-3 space-y-2 animate-bubble-in">
            <input
              type="text"
              placeholder={language === 'es' ? 'Título o descripción *' : 'Title or description *'}
              value={newSource.title}
              onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />

            {guide.fields.includes('source') && (
              <input
                type="text"
                placeholder={language === 'es' ? 'Nombre de la fuente (ej: Vikidia)' : 'Source name (e.g., Vikidia)'}
                value={newSource.source}
                onChange={(e) => setNewSource({ ...newSource, source: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            )}

            {guide.fields.includes('url') && (
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            )}

            {guide.fields.includes('date') && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={newSource.date}
                  onChange={(e) => setNewSource({ ...newSource, date: e.target.value })}
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddSource}
                disabled={!newSource.title}
                className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {language === 'es' ? 'Guardar' : 'Save'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* Sources List */}
        {sources.map((source, index) => (
          <div
            key={index}
            className="bg-muted/20 rounded-xl p-3 space-y-2 animate-bubble-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{source.title}</p>
                  {source.source && (
                    <p className="text-xs text-muted-foreground">{source.source}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRemoveSource(index)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Insert citation buttons */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => onInsertCitation(generateInTextCitation(source, 0))}
                className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {language === 'es' ? '+ Citar en texto' : '+ Cite in text'}
              </button>
              <button
                onClick={() => onInsertCitation(generateListCitation(source))}
                className="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                {language === 'es' ? '+ A la lista' : '+ To list'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Final References Section */}
      {sources.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {language === 'es' ? '📝 Lista de fuentes para el final:' : '📝 Sources list for the end:'}
          </p>
          <div className="bg-background/50 rounded-lg p-3 space-y-1">
            {sources.map((source, index) => (
              <p key={index} className="text-xs text-foreground">
                {generateListCitation(source)}
              </p>
            ))}
          </div>
          <button
            onClick={() => {
              const list = sources.map(s => generateListCitation(s)).join('\n');
              const header = language === 'es' ? '\n\nFuentes:\n' : '\n\nSources:\n';
              onInsertCitation(header + list);
            }}
            className="w-full py-2 text-sm font-medium bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors"
          >
            {language === 'es' ? '📋 Insertar lista de fuentes al reporte' : '📋 Insert sources list to report'}
          </button>
        </div>
      )}
    </div>
  );
}
