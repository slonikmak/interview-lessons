# Спецификация JSON-структуры урока

Ниже — краткая и точная спецификация формата JSON для уроков, выжатая из инструкции "Инструкция_по_созданию_JSON_модулей.md".

## Верхний уровень (Lesson)

- id: string — уникальный идентификатор урока
- title: string — заголовок
- difficulty?: "easy" | "medium" | "hard" — допускается разный регистр; при нормализации приводится к нижнему
- topics?: string[] — список тематик
- goal?: string — краткая цель/формулировка задачи
- sections: Section[] — массив секций (см. ниже)
- created_at?: string (ISO-8601) — дата создания

Пример:
{
  "id": "two_sum",
  "title": "Two Sum — A complete, student-friendly guide",
  "difficulty": "easy",
  "topics": ["Array", "Hash Table"],
  "goal": "Given an array nums and an integer target...",
  "sections": [ /* ... */ ],
  "created_at": "2025-10-21T16:43:50.397Z"
}

## Общие поля секций

Каждая секция содержит минимум:
- type: "text" | "code_task" | "quiz"
- title: string
- ai_chat_history?: Message[]

Message:
- role: "user" | "assistant"
- text: string
- ts?: number — Unix time (мс)
- code?: string — (опционально, расширение для передачи кода пользователя)

Пример сообщения:
{
  "role": "user",
  "text": "Почему тест падает?",
  "ts": 1697890000000,
  "code": "function twoSum(...) { ... }"
}

## Типы секций

### 1) TextSection (type = "text")
- content: string — Markdown (GFM поддерживается)
- ai_chat_history?: Message[]

Пример:
{
  "type": "text",
  "title": "Problem understanding",
  "content": "Markdown-текст...",
  "ai_chat_history": []
}

### 2) CodeTaskSection (type = "code_task")
- description?: string — краткое пояснение
- starter_code: string — стартовый код (первая объявленная функция будет вызываться раннером)
- solution_code?: string — эталонное решение (показывается при state = "SKIPPED")
- tests: TestCase[] — массив тестов (см. ниже)
- hints?: string[]
- state?: "NOT_RESOLVED" | "RESOLVED" | "SKIPPED" — состояние задачи; по умолчанию "NOT_RESOLVED"
- ai_chat_history?: Message[]

Важно по раннеру:
- Раннер извлекает имя первой объявленной функции (например, `function twoSum(...) {}` или `const twoSum = (...) => {}`) и вызывает её в тестах. Поэтому целевая функция должна быть объявлена первой в `starter_code`.

TestCase:
- name?: string — опционально
- input: any[] | object
  - если массив: вызывается fn(...input)
  - если объект: вызывается fn(...values) в порядке полей объекта (во избежание неоднозначности предпочтителен массив)
- expected: any

Примеры тестов:
[
  { "input": [[2,7,11,15], 9], "expected": [0,1] },
  { "input": { "nums": [3,2,4], "target": 6 }, "expected": [1,2] }
]

Состояния задачи:
- NOT_RESOLVED — по умолчанию
- RESOLVED — все тесты пройдены
- SKIPPED — пользователь показал решение; отображать `solution_code`

### 3) QuizSection (type = "quiz")
- questions: QuizQuestion[]
- ai_chat_history?: Message[]

QuizQuestion:
- question: string
- options: string[] — минимум 2 варианта
- answer: string — должен совпадать с одним из options

Пример:
{
  "type": "quiz",
  "title": "Quick check",
  "questions": [
    { "question": "Time complexity?", "options": ["O(n)", "O(n²)"], "answer": "O(n)" }
  ],
  "ai_chat_history": []
}

## Совместимость с текущей схемой
- Текущая Zod-схема (`lib/schemas/lesson.ts`) на момент инструкции еще не включает поля `state` и `solution_code` в `code_task`, а также поле `code` в сообщениях `ai_chat_history`.
- Эти поля можно безопасно добавлять: валидатор их проигнорирует (они не вызовут ошибку), но не попадут в нормализованные типы до обновления схемы.
- `difficulty` нормализуется к нижнему регистру при импортe/валидации.

## Практические рекомендации
- Для тестов предпочтительнее использовать `input` как массив, чтобы избежать зависимости от порядка полей объектов.
- В `code_task` проверку комплемента выполняйте до вставки текущего элемента в словарь (чтобы не использовать тот же элемент дважды).
- Для демонстрации/локальной проверки временно положите JSON-урок в `public/two_sum_full.json` — демонстрационная страница читает именно этот путь.

