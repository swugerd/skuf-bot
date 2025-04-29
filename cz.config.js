module.exports = {
  types: [
    { value: 'feat', name: 'feat: Добавление нового функционала' },
    { value: 'fix', name: 'fix: Исправление багов' },
    { value: 'docs', name: 'docs: Изменения в документации' },
    { value: 'style', name: 'style: Форматирование (пробелы, точки с запятой и т.д.)' },
    { value: 'ref', name: 'refactor: Рефакторинг (без исправления багов)' },
    { value: 'perf', name: 'perf: Повышение производительности' },
    { value: 'test', name: 'test: Добавление или изменение тестов' },
    { value: 'chore', name: 'chore: Обслуживание (обновление зависимостей и т.д.)' },
    { value: 'ci', name: 'ci: Настройки CI/CD' }
  ],
  skipQuestions: ['scope', 'footer'],
  upperCaseSubject: false,
  messages: {
    type: 'Выбери тип коммита:',
    subject: 'Краткое описание (макс. 72 символов):',
    body: 'Полное описание (опционально). Используй "|" для новой строки:',
    confirmCommit: 'Подтвердить коммит?'
  }
};
