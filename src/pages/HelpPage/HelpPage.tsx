import React, { useState, useEffect, useRef } from 'react';
import { BsXLg } from 'react-icons/bs';
import classes from './HelpPage.module.css';

interface HelpPageProps {
    onClose: () => void;
}

// Canvas компоненты для графиков
const TrapezoidalMembershipCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - 2 * padding;

        // Очистка
        ctx.fillStyle = '#282c34';
        ctx.fillRect(0, 0, width, height);

        // Оси
        ctx.strokeStyle = '#abb2bf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Трапеция (a=20, b=40, c=60, d=80 из диапазона 0-100)
        const a = padding + graphWidth * 0.2;
        const b = padding + graphWidth * 0.4;
        const c = padding + graphWidth * 0.6;
        const d = padding + graphWidth * 0.8;
        const top = padding;
        const bottom = height - padding;

        ctx.strokeStyle = '#61afef';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a, bottom);
        ctx.lineTo(b, top);
        ctx.lineTo(c, top);
        ctx.lineTo(d, bottom);
        ctx.stroke();

        // Заливка
        ctx.fillStyle = 'rgba(97, 175, 239, 0.2)';
        ctx.beginPath();
        ctx.moveTo(a, bottom);
        ctx.lineTo(b, top);
        ctx.lineTo(c, top);
        ctx.lineTo(d, bottom);
        ctx.closePath();
        ctx.fill();

        // Метки
        ctx.fillStyle = '#e06c75';
        ctx.font = '14px monospace';
        ctx.fillText('a', a - 5, bottom + 20);
        ctx.fillText('b', b - 5, bottom + 20);
        ctx.fillText('c', c - 5, bottom + 20);
        ctx.fillText('d', d - 5, bottom + 20);

        // Метки осей
        ctx.fillStyle = '#98c379';
        ctx.fillText('μ(x)', 5, padding - 5);
        ctx.fillText('1', padding - 25, top + 5);
        ctx.fillText('0', padding - 25, bottom + 5);
        ctx.fillText('x', width - padding + 10, bottom + 5);
    }, []);

    return <canvas ref={canvasRef} width={500} height={250} style={{ maxWidth: '100%', height: 'auto' }} />;
};

const TriangularMembershipCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - 2 * padding;

        ctx.fillStyle = '#282c34';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#abb2bf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        const a = padding + graphWidth * 0.25;
        const bc = padding + graphWidth * 0.5;
        const d = padding + graphWidth * 0.75;
        const top = padding;
        const bottom = height - padding;

        ctx.strokeStyle = '#61afef';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a, bottom);
        ctx.lineTo(bc, top);
        ctx.lineTo(d, bottom);
        ctx.stroke();

        ctx.fillStyle = 'rgba(97, 175, 239, 0.2)';
        ctx.beginPath();
        ctx.moveTo(a, bottom);
        ctx.lineTo(bc, top);
        ctx.lineTo(d, bottom);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e06c75';
        ctx.font = '14px monospace';
        ctx.fillText('a', a - 5, bottom + 20);
        ctx.fillText('b=c', bc - 15, bottom + 20);
        ctx.fillText('d', d - 5, bottom + 20);

        ctx.fillStyle = '#98c379';
        ctx.fillText('μ(x)', 5, padding - 5);
        ctx.fillText('1', padding - 25, top + 5);
        ctx.fillText('0', padding - 25, bottom + 5);
    }, []);

    return <canvas ref={canvasRef} width={500} height={250} style={{ maxWidth: '100%', height: 'auto' }} />;
};

const LeftEdgeMembershipCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - 2 * padding;

        ctx.fillStyle = '#282c34';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#abb2bf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        const ab = padding + graphWidth * 0.2;
        const c = padding + graphWidth * 0.5;
        const d = padding + graphWidth * 0.7;
        const top = padding;
        const bottom = height - padding;

        ctx.strokeStyle = '#61afef';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(padding, top);
        ctx.lineTo(ab, top);
        ctx.lineTo(c, top);
        ctx.lineTo(d, bottom);
        ctx.stroke();

        ctx.fillStyle = 'rgba(97, 175, 239, 0.2)';
        ctx.beginPath();
        ctx.moveTo(padding, top);
        ctx.lineTo(padding, bottom);
        ctx.lineTo(d, bottom);
        ctx.lineTo(c, top);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e06c75';
        ctx.font = '14px monospace';
        ctx.fillText('a=b', ab - 15, bottom + 20);
        ctx.fillText('c', c - 5, bottom + 20);
        ctx.fillText('d', d - 5, bottom + 20);

        ctx.fillStyle = '#98c379';
        ctx.fillText('μ(x)', 5, padding - 5);
        ctx.fillText('1', padding - 25, top + 5);
        ctx.fillText('0', padding - 25, bottom + 5);
    }, []);

    return <canvas ref={canvasRef} width={500} height={250} style={{ maxWidth: '100%', height: 'auto' }} />;
};

const RightEdgeMembershipCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const graphWidth = width - 2 * padding;

        ctx.fillStyle = '#282c34';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#abb2bf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        const a = padding + graphWidth * 0.3;
        const b = padding + graphWidth * 0.5;
        const cd = padding + graphWidth * 0.8;
        const top = padding;
        const bottom = height - padding;

        ctx.strokeStyle = '#61afef';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a, bottom);
        ctx.lineTo(b, top);
        ctx.lineTo(cd, top);
        ctx.lineTo(width - padding, top);
        ctx.stroke();

        ctx.fillStyle = 'rgba(97, 175, 239, 0.2)';
        ctx.beginPath();
        ctx.moveTo(a, bottom);
        ctx.lineTo(b, top);
        ctx.lineTo(width - padding, top);
        ctx.lineTo(width - padding, bottom);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#e06c75';
        ctx.font = '14px monospace';
        ctx.fillText('a', a - 5, bottom + 20);
        ctx.fillText('b', b - 5, bottom + 20);
        ctx.fillText('c=d', cd - 15, bottom + 20);

        ctx.fillStyle = '#98c379';
        ctx.fillText('μ(x)', 5, padding - 5);
        ctx.fillText('1', padding - 25, top + 5);
        ctx.fillText('0', padding - 25, bottom + 5);
    }, []);

    return <canvas ref={canvasRef} width={500} height={250} style={{ maxWidth: '100%', height: 'auto' }} />;
};

const DefuzzificationMethodsCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const padding = 50;
        const graphWidth = width - 2 * padding;

        ctx.fillStyle = '#282c34';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#abb2bf';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding - 40);
        ctx.lineTo(width - padding, height - padding - 40);
        ctx.stroke();

        // Агрегированная функция (трапеция)
        const x1 = padding + graphWidth * 0.1;
        const x2 = padding + graphWidth * 0.3;
        const x3 = padding + graphWidth * 0.7;
        const x4 = padding + graphWidth * 0.9;
        const top = padding;
        const bottom = height - padding - 40;

        ctx.strokeStyle = '#61afef';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, bottom);
        ctx.lineTo(x2, top);
        ctx.lineTo(x3, top);
        ctx.lineTo(x4, bottom);
        ctx.stroke();

        ctx.fillStyle = 'rgba(97, 175, 239, 0.2)';
        ctx.beginPath();
        ctx.moveTo(x1, bottom);
        ctx.lineTo(x2, top);
        ctx.lineTo(x3, top);
        ctx.lineTo(x4, bottom);
        ctx.closePath();
        ctx.fill();

        // Метки точек дефаззификации
        const som = padding + graphWidth * 0.31;
        const mom = padding + graphWidth * 0.5;
        const lom = padding + graphWidth * 0.69;

        // SOM
        ctx.strokeStyle = '#e06c75';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(som, top - 10);
        ctx.lineTo(som, bottom + 10);
        ctx.stroke();
        ctx.fillStyle = '#e06c75';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('①', som - 8, top - 15);

        // MOM
        ctx.strokeStyle = '#98c379';
        ctx.beginPath();
        ctx.moveTo(mom, top - 10);
        ctx.lineTo(mom, bottom + 10);
        ctx.stroke();
        ctx.fillStyle = '#98c379';
        ctx.fillText('②', mom - 8, top - 15);

        // LOM
        ctx.strokeStyle = '#e5c07b';
        ctx.beginPath();
        ctx.moveTo(lom, top - 10);
        ctx.lineTo(lom, bottom + 10);
        ctx.stroke();
        ctx.fillStyle = '#e5c07b';
        ctx.fillText('③', lom - 8, top - 15);

        // Метки осей
        ctx.fillStyle = '#abb2bf';
        ctx.font = '14px monospace';
        ctx.fillText('μ(x)', 5, padding - 5);
        ctx.fillText('1.0', padding - 35, top + 5);
        ctx.fillText('0.5', padding - 35, (top + bottom) / 2 + 5);
        ctx.fillText('0.0', padding - 35, bottom + 5);
        ctx.fillText('x', width - padding + 10, bottom + 5);

        // Легенда внизу
        const legendY = height - 25;
        ctx.fillStyle = '#e06c75';
        ctx.fillText('① SOM ≈ 25', padding, legendY);
        ctx.fillStyle = '#98c379';
        ctx.fillText('② MOM ≈ 40', padding + 120, legendY);
        ctx.fillStyle = '#e5c07b';
        ctx.fillText('③ LOM ≈ 55', padding + 240, legendY);
        ctx.fillStyle = '#61afef';
        ctx.fillText('Центроид ≈ 38', padding + 360, legendY);
    }, []);

    return <canvas ref={canvasRef} width={600} height={320} style={{ maxWidth: '100%', height: 'auto', background: '#282c34' }} />;
};

type Section = {
    id: string;
    title: string;
    subsections?: Section[];
};

const sections: Section[] = [
    {
        id: 'intro',
        title: 'Введение',
        subsections: [
            { id: 'what-is', title: 'Что такое FuzzyDB' },
            { id: 'key-concepts', title: 'Ключевые понятия' },
        ],
    },
    {
        id: 'getting-started',
        title: 'Начало работы',
        subsections: [
            { id: 'create-problem', title: 'Создание проблемы' },
            { id: 'problem-hierarchy', title: 'Иерархия проблем' },
            { id: 'import-export', title: 'Импорт и экспорт' },
        ],
    },
    {
        id: 'input-parameters',
        title: 'Входные параметры',
        subsections: [
            { id: 'add-input-param', title: 'Добавление параметра' },
            { id: 'input-param-settings', title: 'Настройка диапазона' },
            { id: 'input-values', title: 'Нечёткие термы' },
            { id: 'fuzzy-sets', title: 'Функции принадлежности' },
        ],
    },
    {
        id: 'output-parameters',
        title: 'Выходные параметры',
        subsections: [
            { id: 'add-output-param', title: 'Добавление параметра' },
            { id: 'output-param-settings', title: 'Настройка диапазона' },
            { id: 'output-values', title: 'Нечёткие термы выхода' },
        ],
    },
    {
        id: 'rules',
        title: 'Таблица правил',
        subsections: [
            { id: 'rules-overview', title: 'Обзор таблицы' },
            { id: 'edit-rules', title: 'Редактирование правил' },
            { id: 'rule-generation', title: 'Автоматическая генерация' },
        ],
    },
    {
        id: 'inference',
        title: 'Нечёткий вывод',
        subsections: [
            { id: 'evaluation', title: 'Вычисление результата' },
            { id: 'defuzzification', title: 'Методы дефаззификации' },
            { id: 'detailed-view', title: 'Детальный просмотр' },
        ],
    },
    {
        id: 'user-scenarios',
        title: 'Сценарии использования',
        subsections: [
            { id: 'scenario-complete', title: 'Полный сценарий работы' },
            { id: 'scenario-simple', title: 'Простой пример' },
            { id: 'scenario-complex', title: 'Сложная иерархия' },
        ],
    },
];

const HelpPage: React.FC<HelpPageProps> = ({ onClose }) => {
    const [activeSection, setActiveSection] = useState<string>('intro');

    const renderContent = () => {
        switch (activeSection) {
            case 'what-is':
                return (
                    <>
                        <h1>Что такое FuzzyDB</h1>
                        <p>
                            <strong>FuzzyDB</strong> — это десктопное приложение для проектирования и выполнения систем нечёткого логического вывода (Fuzzy Logic Inference Systems).
                        </p>
                        <p>
                            Приложение позволяет создавать иерархические структуры задач (проблем), определять входные и выходные параметры с нечёткими термами,
                            настраивать базу правил и получать результаты на основе методов нечёткого вывода.
                        </p>
                        <h3>Основные возможности:</h3>
                        <ul>
                            <li>Создание иерархии проблем (задач)</li>
                            <li>Определение входных параметров с нечёткими лингвистическими термами</li>
                            <li>Определение выходных параметров</li>
                            <li>Построение базы правил нечёткого вывода</li>
                            <li>Визуализация функций принадлежности</li>
                            <li>Вычисление результатов с различными методами дефаззификации</li>
                            <li>Детальный просмотр процесса вывода</li>
                            <li>Импорт и экспорт конфигураций</li>
                        </ul>
                    </>
                );

            case 'key-concepts':
                return (
                    <>
                        <h1>Ключевые понятия</h1>
                        
                        <h3>Проблема (Problem)</h3>
                        <p>
                            Базовая единица организации в приложении. Проблемы организованы в иерархическую структуру (дерево), 
                            где каждая проблема может содержать дочерние подпроблемы.
                        </p>

                        <h3>Входной параметр (Input Parameter)</h3>
                        <p>
                            Переменная, для которой задаётся диапазон значений и набор нечётких термов (лингвистических переменных).
                            Например: "Температура" с диапазоном [0, 100]°C и термами "Холодная", "Умеренная", "Горячая".
                        </p>

                        <h3>Нечёткий терм (Fuzzy Term)</h3>
                        <p>
                            Лингвистическое значение параметра, определяемое функцией принадлежности (трапециевидной или треугольной).
                            Функция принадлежности задаёт степень соответствия числового значения данному терму.
                        </p>

                        <h3>Функция принадлежности (Membership Function)</h3>
                        <p>
                            Трапециевидная функция, определяемая четырьмя точками [a, b, c, d]:
                        </p>
                        <ul>
                            <li><strong>a</strong> — начало возрастания (μ=0)</li>
                            <li><strong>b</strong> — начало плато (μ=1)</li>
                            <li><strong>c</strong> — конец плато (μ=1)</li>
                            <li><strong>d</strong> — конец убывания (μ=0)</li>
                        </ul>
                        <p>При b=c функция становится треугольной.</p>

                        <h3>Выходной параметр (Output Parameter)</h3>
                        <p>
                            Результирующая переменная системы нечёткого вывода. Также имеет диапазон и набор нечётких термов.
                        </p>

                        <h3>База правил (Rule Base)</h3>
                        <p>
                            Набор правил вида "ЕСЛИ входы A И B И C, ТО выход X". В приложении представлена в виде таблицы,
                            где строки соответствуют комбинациям входных значений, а столбцы — выходным параметрам.
                        </p>

                        <h3>Нечёткий вывод (Fuzzy Inference)</h3>
                        <p>
                            Процесс преобразования чётких входных значений в чёткий выход через этапы:
                        </p>
                        <ol>
                            <li><strong>Фаззификация</strong> — определение степеней принадлежности входов к термам</li>
                            <li><strong>Агрегирование</strong> — вычисление степени выполнения посылки каждого правила (операция min для "И")</li>
                            <li><strong>Активация</strong> — применение степени выполнения правила к выходному терму</li>
                            <li><strong>Аккумуляция</strong> — объединение результатов всех активированных правил (операция max)</li>
                            <li><strong>Дефаззификация</strong> — получение чёткого числового результата</li>
                        </ol>

                        <h3>Дефаззификация (Defuzzification)</h3>
                        <p>
                            Метод преобразования нечёткого множества в чёткое число. Доступные методы:
                        </p>
                        <ul>
                            <li><strong>Центроид (Centroid)</strong> — метод центра тяжести, центр площади под кривой функции принадлежности</li>
                            <li><strong>Биссектриса (Bisector)</strong> — метод медианы, точка делящая площадь пополам</li>
                            <li><strong>Метод средних максимумов (MOM)</strong> — среднее значение точек с максимальной принадлежностью</li>
                            <li><strong>Метод наименьшего максимума (SOM)</strong> — минимальное значение среди точек с μ_max</li>
                            <li><strong>Метод наибольшего максимума (LOM)</strong> — максимальное значение среди точек с μ_max</li>
                        </ul>
                    </>
                );

            case 'create-problem':
                return (
                    <>
                        <h1>Создание проблемы</h1>
                        <p>
                            Проблема — это контейнер для вашей системы нечёткого вывода. Все проблемы организованы в иерархическую структуру.
                        </p>

                        <h3>Шаги создания:</h3>
                        <ol>
                            <li>
                                <strong>Откройте список проблем</strong>
                                <p>При запуске приложения отображается корневой уровень иерархии проблем.</p>
                            </li>
                            <li>
                                <strong>Нажмите кнопку "+"</strong>
                                <p>В правом меню нажмите иконку <code>➕</code> "Добавить проблему".</p>
                            </li>
                            <li>
                                <strong>Заполните форму:</strong>
                                <ul>
                                    <li><strong>Название</strong> — краткое имя проблемы (обязательно)</li>
                                    <li><strong>Описание</strong> — подробное описание задачи (опционально)</li>
                                    <li><strong>Изображение</strong> — можно прикрепить иллюстрацию (опционально)</li>
                                    <li><strong>Финальная проблема</strong> — отметьте, если это конечная задача (не содержит подзадач)</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Сохраните</strong>
                                <p>Проблема появится в списке в виде карточки.</p>
                            </li>
                        </ol>

                        <h3>Работа с проблемой:</h3>
                        <ul>
                            <li><strong>Открыть</strong> — кликните по карточке для входа в проблему</li>
                            <li><strong>Редактировать</strong> — используйте иконку редактирования на карточке</li>
                            <li><strong>Удалить</strong> — используйте иконку удаления (удаляются все вложенные подпроблемы!)</li>
                            <li><strong>Экспорт</strong> — кнопка экспорта сохраняет проблему и всю её иерархию в JSON-файл</li>
                        </ul>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Используйте финальные проблемы для настройки систем нечёткого вывода, 
                            а нефинальные — для организации иерархии и группировки связанных задач.
                        </div>
                    </>
                );

            case 'problem-hierarchy':
                return (
                    <>
                        <h1>Иерархия проблем</h1>
                        <p>
                            Проблемы в FuzzyDB организованы в виде дерева. Это позволяет структурировать сложные системы на подзадачи.
                        </p>

                        <h3>Навигация по иерархии:</h3>
                        <p>
                            В верхней части экрана отображается хлебные крошки (breadcrumb) — путь от корня до текущей проблемы.
                            Кликните по любому элементу пути для быстрого перехода на соответствующий уровень.
                        </p>

                        <h3>Типы проблем:</h3>
                        
                        <h4>Нефинальная проблема (контейнер)</h4>
                        <ul>
                            <li>Содержит подпроблемы</li>
                            <li>Не содержит параметров и правил</li>
                            <li>Используется для организации структуры</li>
                            <li>Пример: "Управление производством" → подпроблемы: "Контроль качества", "Оптимизация процессов"</li>
                        </ul>

                        <h4>Финальная проблема (рабочая)</h4>
                        <ul>
                            <li>Не содержит подпроблем</li>
                            <li>Содержит входные/выходные параметры и базу правил</li>
                            <li>Здесь настраивается система нечёткого вывода</li>
                            <li>Пример: "Оценка риска проекта" с входами "Сложность", "Бюджет" и выходом "Уровень риска"</li>
                        </ul>

                        <h3>Пример иерархии:</h3>
                        <div className={classes.TreeView}>
                            <div className={classes.TreeItem}>
                                <span>📁 <strong>Умный дом</strong></span>
                            </div>
                            <div className={classes.TreeItem} style={{marginLeft: '20px'}}>
                                <span>📁 Климат-контроль</span>
                            </div>
                            <div className={classes.TreeItem} style={{marginLeft: '40px'}}>
                                <span>🎯 Управление отоплением (финальная)</span>
                            </div>
                            <div className={classes.TreeItem} style={{marginLeft: '40px'}}>
                                <span>🎯 Управление кондиционером (финальная)</span>
                            </div>
                            <div className={classes.TreeItem} style={{marginLeft: '20px'}}>
                                <span>📁 Освещение</span>
                            </div>
                            <div className={classes.TreeItem} style={{marginLeft: '40px'}}>
                                <span>🎯 Яркость по времени суток (финальная)</span>
                            </div>
                            <div className={classes.TreeItem} style={{marginLeft: '40px'}}>
                                <span>🎯 Цветовая температура (финальная)</span>
                            </div>
                            <div className={classes.TreeItem} style={{marginLeft: '20px'}}>
                                <span>🎯 Безопасность (финальная)</span>
                            </div>
                        </div>

                        <div className={classes.Warning}>
                            <strong>⚠️ Внимание:</strong> При удалении проблемы удаляются ВСЕ её подпроблемы. 
                            Используйте функцию экспорта для создания резервных копий.
                        </div>
                    </>
                );

            case 'import-export':
                return (
                    <>
                        <h1>Импорт и экспорт</h1>
                        <p>
                            FuzzyDB поддерживает полный экспорт и импорт проблем вместе со всей конфигурацией.
                        </p>

                        <h3>Экспорт проблемы:</h3>
                        <ol>
                            <li>Откройте список проблем (перейдите на уровень, где находится нужная проблема)</li>
                            <li>На карточке проблемы нажмите иконку <strong>экспорта (стрелка вверх)</strong></li>
                            <li>Выберите место сохранения JSON-файла</li>
                            <li>Файл содержит:
                                <ul>
                                    <li>Название, описание, изображение</li>
                                    <li>Все входные и выходные параметры</li>
                                    <li>Все нечёткие термы с их функциями принадлежности</li>
                                    <li>Полную базу правил</li>
                                    <li>Всю иерархию дочерних проблем (рекурсивно)</li>
                                </ul>
                            </li>
                        </ol>

                        <h3>Импорт проблемы:</h3>
                        <ol>
                            <li>Перейдите на уровень иерархии, куда хотите импортировать проблему</li>
                            <li>В правом меню нажмите иконку <strong>импорта (стрелка вниз)</strong></li>
                            <li>Выберите JSON-файл экспортированной проблемы</li>
                            <li>Проблема будет создана на текущем уровне со всем содержимым</li>
                        </ol>

                        <h3>Что сохраняется при экспорте:</h3>
                        <ul>
                            <li>✅ Полная структура параметров</li>
                            <li>✅ Все нечёткие термы с точными значениями a, b, c, d</li>
                            <li>✅ База правил</li>
                            <li>✅ Диапазоны параметров (start, end)</li>
                            <li>✅ Иерархия дочерних проблем</li>
                            <li>✅ Изображения (кодируются в base64)</li>
                        </ul>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Используйте экспорт/импорт для:
                            <ul>
                                <li>Резервного копирования конфигураций</li>
                                <li>Обмена системами между устройствами</li>
                                <li>Создания шаблонов типовых задач</li>
                                <li>Версионирования (сохраняйте файлы с датой в названии)</li>
                            </ul>
                        </div>

                        <h3>Формат файла:</h3>
                        <p>
                            Экспортированный файл имеет расширение <code>.json</code> и содержит структурированные данные в формате JSON.
                            Файл можно открыть в текстовом редакторе для просмотра или ручного редактирования (для опытных пользователей).
                        </p>
                    </>
                );

            case 'add-input-param':
                return (
                    <>
                        <h1>Добавление входного параметра</h1>
                        <p>
                            Входные параметры — это переменные, на основе которых система принимает решения.
                        </p>

                        <h3>Как добавить:</h3>
                        <ol>
                            <li>Откройте финальную проблему (кликните по её карточке)</li>
                            <li>Перейдите на вкладку <strong>"Входные параметры"</strong> (иконка стрелки вправо)</li>
                            <li>Нажмите кнопку <strong>"+"</strong> в правом меню</li>
                            <li>Новый параметр появится в списке с названием "Новый параметр"</li>
                        </ol>

                        <h3>Настройка параметра:</h3>
                        <p>Кликните по заголовку карточки параметра для её раскрытия. Доступные действия:</p>
                        
                        <h4>1. Изменение названия</h4>
                        <ul>
                            <li>Кликните по названию параметра</li>
                            <li>Введите новое имя (например: "Температура", "Скорость", "Влажность")</li>
                            <li>Нажмите Enter или кликните вне поля для сохранения</li>
                        </ul>

                        <h4>2. Настройка диапазона</h4>
                        <ul>
                            <li>Найдите поля "Start" и "End" в раскрытой карточке</li>
                            <li>Введите минимальное и максимальное значения параметра</li>
                            <li>Пример: для температуры [0, 100]°C</li>
                            <li>Все нечёткие термы должны находиться в этом диапазоне</li>
                        </ul>

                        <h4>3. Добавление нечётких термов</h4>
                        <ul>
                            <li>В раскрытой карточке найдите секцию термов</li>
                            <li>Нажмите кнопку "+" для добавления термв</li>
                            <li>Каждый терм автоматически получает функцию принадлежности</li>
                        </ul>

                        <h3>Управление порядком параметров:</h3>
                        <ul>
                            <li>Используйте стрелки ↑↓ на карточке для изменения порядка</li>
                            <li>Порядок влияет на отображение в таблице правил</li>
                        </ul>

                        <div className={classes.Warning}>
                            <strong>⚠️ Важно:</strong> При удалении входного параметра удаляются все его термы 
                            и обновляется таблица правил! Все правила будут пересозданы.
                        </div>
                    </>
                );

            case 'input-param-settings':
                return (
                    <>
                        <h1>Настройка диапазона входного параметра</h1>
                        <p>
                            Каждый входной параметр имеет числовой диапазон [Start, End], в котором определяются значения.
                        </p>

                        <h3>Как настроить диапазон:</h3>
                        <ol>
                            <li>Раскройте карточку параметра</li>
                            <li>Найдите поля <strong>Start</strong> и <strong>End</strong></li>
                            <li>Введите числовые значения</li>
                            <li>Изменения сохраняются автоматически при потере фокуса</li>
                        </ol>

                        <h3>Примеры диапазонов:</h3>
                        <table className={classes.Table}>
                            <thead>
                                <tr>
                                    <th>Параметр</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Единицы</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Температура</td>
                                    <td>0</td>
                                    <td>100</td>
                                    <td>°C</td>
                                </tr>
                                <tr>
                                    <td>Скорость</td>
                                    <td>0</td>
                                    <td>200</td>
                                    <td>км/ч</td>
                                </tr>
                                <tr>
                                    <td>Влажность</td>
                                    <td>0</td>
                                    <td>100</td>
                                    <td>%</td>
                                </tr>
                                <tr>
                                    <td>Давление</td>
                                    <td>700</td>
                                    <td>800</td>
                                    <td>мм рт.ст.</td>
                                </tr>
                                <tr>
                                    <td>Оценка</td>
                                    <td>0</td>
                                    <td>10</td>
                                    <td>баллы</td>
                                </tr>
                            </tbody>
                        </table>

                        <h3>Правила для диапазона:</h3>
                        <ul>
                            <li>Start должен быть меньше End</li>
                            <li>Можно использовать отрицательные значения</li>
                            <li>Можно использовать дробные значения</li>
                            <li>Все функции принадлежности термов должны помещаться в диапазон</li>
                        </ul>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Выбирайте диапазон, охватывающий все практически возможные значения параметра.
                            Если входное значение окажется вне диапазона, оно будет обрабатываться с нулевой принадлежностью ко всем термам.
                        </div>

                        <h3>Что происходит при изменении диапазона:</h3>
                        <ul>
                            <li>Существующие термы сохраняют свои параметры [a,b,c,d]</li>
                            <li>График функций принадлежности обновляется</li>
                            <li>Если термы выходят за новый диапазон, их нужно скорректировать вручную</li>
                        </ul>
                    </>
                );

            case 'input-values':
                return (
                    <>
                        <h1>Нечёткие термы входного параметра</h1>
                        <p>
                            Нечёткий терм (лингвистическая переменная) — это словесное описание диапазона значений параметра.
                        </p>

                        <h3>Примеры термов:</h3>
                        <ul>
                            <li>Для температуры: "Холодно", "Умеренно", "Тепло", "Жарко"</li>
                            <li>Для скорости: "Медленно", "Средне", "Быстро"</li>
                            <li>Для размера: "Маленький", "Средний", "Большой"</li>
                        </ul>

                        <h3>Добавление терма:</h3>
                        <ol>
                            <li>Раскройте карточку входного параметра</li>
                            <li>В секции термов нажмите кнопку <strong>"+"</strong></li>
                            <li>Новый терм появится в списке с автоматически подобранными параметрами</li>
                            <li>Кликните на название для редактирования</li>
                        </ol>

                        <h3>Автоматическое разбиение (Partition):</h3>
                        <p>
                            При добавлении нового терма приложение автоматически разбивает диапазон параметра, 
                            используя <strong>правила разбиения Руспини</strong> для создания перекрывающихся функций принадлежности.
                        </p>

                        <h4>Правила разбиения:</h4>
                        <ul>
                            <li><strong>Первый терм</strong>: покрывает весь диапазон [start, end] с плато по всей длине</li>
                            <li><strong>Добавление 2-го терма</strong>: первый терм делится пополам, создаётся перекрытие</li>
                            <li><strong>Последующие термы</strong>: крайний правый терм делится, сохраняя перекрытия</li>
                            <li><strong>Перекрытие</strong>: соседние термы перекрываются так, что сумма принадлежностей = 1</li>
                        </ul>

                        <div className={classes.TermDiagram}>
                            <h4 style={{color: '#98c379', marginBottom: '15px'}}>Пример разбиения [0, 100]:</h4>
                            <div className={classes.TermLine}>
                                <span className={classes.Label}>1 терм:</span>
                                <span className={classes.Range}>[0——————50——————100]</span>
                                <span className={classes.Name}>(весь диапазон)</span>
                            </div>
                            <div style={{height: '15px'}}></div>
                            <div className={classes.TermLine}>
                                <span className={classes.Label}>2 терма:</span>
                                <span className={classes.Range}>[0——25——50]</span>
                                <span className={classes.Name}>(Низкий)</span>
                            </div>
                            <div className={classes.TermLine}>
                                <span className={classes.Label}></span>
                                <span className={classes.Range} style={{marginLeft: '90px'}}>[25——50——75——100]</span>
                                <span className={classes.Name}>(Высокий)</span>
                            </div>
                            <div style={{height: '15px'}}></div>
                            <div className={classes.TermLine}>
                                <span className={classes.Label}>3 терма:</span>
                                <span className={classes.Range}>[0——20——40]</span>
                                <span className={classes.Name}>(Низкий)</span>
                            </div>
                            <div className={classes.TermLine}>
                                <span className={classes.Label}></span>
                                <span className={classes.Range} style={{marginLeft: '90px'}}>[20——40——60]</span>
                                <span className={classes.Name}>(Средний)</span>
                            </div>
                            <div className={classes.TermLine}>
                                <span className={classes.Label}></span>
                                <span className={classes.Range} style={{marginLeft: '150px'}}>[40——60——80——100]</span>
                                <span className={classes.Name}>(Высокий)</span>
                            </div>
                        </div>

                        <h3>Ручное редактирование функции принадлежности:</h3>
                        <p>После автоматического создания можно вручную скорректировать параметры:</p>
                        <ul>
                            <li><strong>a</strong> — начальная точка (где μ начинает расти от 0)</li>
                            <li><strong>b</strong> — начало плато (где μ достигает 1)</li>
                            <li><strong>c</strong> — конец плато (где μ начинает падать от 1)</li>
                            <li><strong>d</strong> — конечная точка (где μ возвращается к 0)</li>
                        </ul>

                        <h3>Визуализация:</h3>
                        <p>
                            График в карточке параметра показывает все функции принадлежности термов одновременно.
                            Разные термы отображаются разными цветами для лучшей читаемости.
                        </p>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Для типичных задач достаточно 3-7 термов на параметр.
                            Слишком много термов усложняет настройку правил, слишком мало — снижает точность системы.
                        </div>
                    </>
                );

            case 'fuzzy-sets':
                return (
                    <>
                        <h1>Функции принадлежности</h1>
                        <p>
                            Функция принадлежности определяет степень (от 0 до 1), с которой конкретное числовое значение принадлежит нечёткому терму.
                        </p>

                        <h3>Трапециевидная функция принадлежности:</h3>
                        <p>
                            Основной тип функций в FuzzyDB. Определяется четырьмя параметрами <strong>[a, b, c, d]</strong>:
                        </p>

                        <div className={classes.CodeBlock}>
                            <TrapezoidalMembershipCanvas />
                        </div>

                        <h4>Формула:</h4>
                        <div className={classes.Formula}>
                            <pre>{`        │ 0,           если x ≤ a
        │ (x-a)/(b-a), если a < x < b
μ(x) = ─┤ 1,           если b ≤ x ≤ c
        │ (d-x)/(d-c), если c < x < d
        │ 0,           если x ≥ d`}</pre>
                        </div>

                        <h3>Треугольная функция:</h3>
                        <p>
                            Частный случай трапециевидной, когда <strong>b = c</strong> (нет плато):
                        </p>

                        <div className={classes.CodeBlock}>
                            <TriangularMembershipCanvas />
                        </div>

                        <h3>Краевые термы:</h3>
                        
                        <h4>Левый краевой терм (a = b):</h4>
                        <div className={classes.CodeBlock}>
                            <LeftEdgeMembershipCanvas />
                        </div>

                        <h4>Правый краевой терм (c = d):</h4>
                        <div className={classes.CodeBlock}>
                            <RightEdgeMembershipCanvas />
                        </div>

                        <h3>Интерактивное редактирование:</h3>
                        <p>В карточке терма вы можете:</p>
                        <ul>
                            <li>Изменять значения a, b, c, d напрямую в числовых полях</li>
                            <li>Наблюдать изменения на графике в реальном времени</li>
                            <li>Переключать между трапециевидной и треугольной формой (checkbox "Треугольная")</li>
                        </ul>

                        <h3>Правила построения корректных функций:</h3>
                        <ul>
                            <li><strong>a ≤ b ≤ c ≤ d</strong> — порядок параметров</li>
                            <li><strong>a, d</strong> должны находиться в диапазоне [start, end] параметра</li>
                            <li>Для хорошего покрытия: соседние термы должны перекрываться</li>
                            <li>Для разбиения Руспини: в точке пересечения μ₁(x) + μ₂(x) = 1</li>
                        </ul>

                        <div className={classes.Warning}>
                            <strong>⚠️ Внимание:</strong> При импорте проблемы функции принадлежности загружаются 
                            с точными значениями из файла (без автоматического пересчёта).
                        </div>
                    </>
                );

            case 'add-output-param':
                return (
                    <>
                        <h1>Добавление выходного параметра</h1>
                        <p>
                            Выходные параметры — это результаты работы системы нечёткого вывода.
                        </p>

                        <h3>Как добавить:</h3>
                        <ol>
                            <li>Откройте финальную проблему</li>
                            <li>Перейдите на вкладку <strong>"Выходные параметры"</strong> (иконка стрелки влево)</li>
                            <li>Нажмите кнопку <strong>"+"</strong> в правом меню</li>
                            <li>Новый параметр появится в списке</li>
                        </ol>

                        <h3>Настройка аналогична входным параметрам:</h3>
                        <ul>
                            <li>Раскройте карточку параметра</li>
                            <li>Измените название (например: "Уровень риска", "Скорость вентилятора")</li>
                            <li>Настройте диапазон [Start, End]</li>
                            <li>Добавьте нечёткие термы</li>
                        </ul>

                        <h3>Отличия от входных параметров:</h3>
                        <ul>
                            <li>Выходные параметры не участвуют в фаззификации входов</li>
                            <li>Их термы используются в базе правил как заключения</li>
                            <li>При выводе выходные термы агрегируются и дефаззифицируются</li>
                        </ul>

                        <h3>Примеры выходных параметров:</h3>
                        <table className={classes.Table}>
                            <thead>
                                <tr>
                                    <th>Задача</th>
                                    <th>Входы</th>
                                    <th>Выходной параметр</th>
                                    <th>Термы выхода</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Управление кондиционером</td>
                                    <td>Температура, Влажность</td>
                                    <td>Мощность охлаждения</td>
                                    <td>Выключен, Слабо, Средне, Сильно</td>
                                </tr>
                                <tr>
                                    <td>Оценка кредитного риска</td>
                                    <td>Доход, История, Долг</td>
                                    <td>Уровень риска</td>
                                    <td>Низкий, Средний, Высокий</td>
                                </tr>
                                <tr>
                                    <td>Автопилот</td>
                                    <td>Скорость, Дистанция</td>
                                    <td>Торможение</td>
                                    <td>Нет, Лёгкое, Среднее, Резкое</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Обычно достаточно 1-3 выходных параметров. 
                            Если требуется много выходов, рассмотрите возможность разделения на несколько подпроблем.
                        </div>
                    </>
                );

            case 'output-param-settings':
                return (
                    <>
                        <h1>Настройка выходного параметра</h1>
                        <p>
                            Настройка выходного параметра идентична настройке входного параметра.
                        </p>

                        <h3>Шаги:</h3>
                        <ol>
                            <li>Раскройте карточку выходного параметра</li>
                            <li>Задайте осмысленное название</li>
                            <li>Настройте диапазон [Start, End]</li>
                            <li>Добавьте нечёткие термы (минимум 2-3)</li>
                        </ol>

                        <h3>Диапазон выходного параметра:</h3>
                        <p>
                            Выберите диапазон, охватывающий все возможные результаты вашей системы.
                        </p>

                        <h4>Примеры:</h4>
                        <ul>
                            <li><strong>Процентные значения:</strong> [0, 100]</li>
                            <li><strong>Оценки:</strong> [0, 10] или [1, 5]</li>
                            <li><strong>Мощность/скорость:</strong> [0, MAX] где MAX — максимальное значение оборудования</li>
                            <li><strong>Угол поворота:</strong> [-180, 180]°</li>
                        </ul>

                        <h3>Количество термов выхода:</h3>
                        <p>
                            Обычно используется 3-7 термов. Количество должно соответствовать детализации управления:
                        </p>
                        <ul>
                            <li><strong>3 терма</strong>: грубое управление (Низкий/Средний/Высокий)</li>
                            <li><strong>5 термов</strong>: стандартная детализация (Очень низкий/Низкий/Средний/Высокий/Очень высокий)</li>
                            <li><strong>7+ термов</strong>: высокая детализация для прецизионного управления</li>
                        </ul>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Количество термов влияет на размер таблицы правил. 
                            Если у вас 3 входа по 5 термов и 2 выхода по 5 термов, таблица будет содержать 5³ = 125 правил.
                        </div>
                    </>
                );

            case 'output-values':
                return (
                    <>
                        <h1>Нечёткие термы выходного параметра</h1>
                        <p>
                            Термы выходных параметров определяют возможные результаты системы нечёткого вывода.
                        </p>

                        <h3>Создание термов выхода:</h3>
                        <p>
                            Процесс идентичен созданию термов для входных параметров:
                        </p>
                        <ol>
                            <li>Раскройте карточку выходного параметра</li>
                            <li>Нажмите "+" для добавления терма</li>
                            <li>Функции принадлежности создаются автоматически с разбиением Руспини</li>
                            <li>Отредактируйте названия термов (например: "Очень низкая скорость", "Низкая", "Средняя"...)</li>
                        </ol>

                        <h3>Использование в правилах:</h3>
                        <p>
                            После создания термов выхода они становятся доступны в таблице правил как возможные заключения.
                        </p>

                        <h3>Пример настройки:</h3>
                        <div className={classes.Example}>
                            <h4>Параметр: "Скорость вентилятора" [0, 100]%</h4>
                            <table className={classes.Table}>
                                <thead>
                                    <tr>
                                        <th>Терм</th>
                                        <th>a</th>
                                        <th>b</th>
                                        <th>c</th>
                                        <th>d</th>
                                        <th>Описание</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Выключен</td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td>10</td>
                                        <td>20</td>
                                        <td>0-10% (практически выключен)</td>
                                    </tr>
                                    <tr>
                                        <td>Медленно</td>
                                        <td>10</td>
                                        <td>20</td>
                                        <td>30</td>
                                        <td>40</td>
                                        <td>20-30% мощности</td>
                                    </tr>
                                    <tr>
                                        <td>Средне</td>
                                        <td>30</td>
                                        <td>40</td>
                                        <td>60</td>
                                        <td>70</td>
                                        <td>40-60% мощности</td>
                                    </tr>
                                    <tr>
                                        <td>Быстро</td>
                                        <td>60</td>
                                        <td>70</td>
                                        <td>80</td>
                                        <td>90</td>
                                        <td>70-80% мощности</td>
                                    </tr>
                                    <tr>
                                        <td>Максимум</td>
                                        <td>80</td>
                                        <td>90</td>
                                        <td>100</td>
                                        <td>100</td>
                                        <td>90-100% мощности</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className={classes.Warning}>
                            <strong>⚠️ Внимание:</strong> Изменение или удаление термов выхода не влияет автоматически на таблицу правил.
                            После изменения термов проверьте и обновите правила вручную.
                        </div>
                    </>
                );

            case 'rules-overview':
                return (
                    <>
                        <h1>Обзор таблицы правил</h1>
                        <p>
                            Таблица правил (Rule Base) — это сердце системы нечёткого вывода. 
                            Здесь определяется логика: какие комбинации входных значений приводят к каким выходным результатам.
                        </p>

                        <h3>Структура таблицы:</h3>
                        <ul>
                            <li><strong>Строки</strong> — все возможные комбинации входных термов</li>
                            <li><strong>Левые столбцы</strong> — входные параметры (серый фон, нередактируемые)</li>
                            <li><strong>Правые столбцы</strong> — выходные параметры (белый фон, редактируемые)</li>
                        </ul>

                        <h3>Как читать таблицу:</h3>
                        <p>Каждая строка — это одно правило вида:</p>
                        <div className={classes.Formula}>
                            <pre>ЕСЛИ [Вход1 = Терм1] И [Вход2 = Терм2] И ...
  ТО
    [Выход = ТермВыхода]</pre>
                        </div>

                        <h3>Пример таблицы:</h3>
                        <div className={classes.Example}>
                            <p><strong>Проблема:</strong> "Управление кондиционером"</p>
                            <table className={classes.Table}>
                                <thead>
                                    <tr>
                                        <th>Температура</th>
                                        <th>Влажность</th>
                                        <th>→ Мощность</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Холодно</td>
                                        <td>Сухо</td>
                                        <td>Выключен</td>
                                    </tr>
                                    <tr>
                                        <td>Холодно</td>
                                        <td>Влажно</td>
                                        <td>Выключен</td>
                                    </tr>
                                    <tr>
                                        <td>Тепло</td>
                                        <td>Сухо</td>
                                        <td>Слабо</td>
                                    </tr>
                                    <tr>
                                        <td>Тепло</td>
                                        <td>Влажно</td>
                                        <td>Средне</td>
                                    </tr>
                                    <tr>
                                        <td>Жарко</td>
                                        <td>Сухо</td>
                                        <td>Средне</td>
                                    </tr>
                                    <tr>
                                        <td>Жарко</td>
                                        <td>Влажно</td>
                                        <td>Сильно</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h3>Навигация по таблице:</h3>
                        <ul>
                            <li>Прокручивайте горизонтально для просмотра всех выходных параметров</li>
                            <li>Прокручивайте вертикально для просмотра всех комбинаций входов</li>
                            <li>Наведите курсор на ячейку для выделения строки и столбца</li>
                        </ul>

                        <h3>Количество правил:</h3>
                        <p>
                            Общее количество правил = произведение количеств термов всех входных параметров.
                        </p>
                        <div className={classes.Formula}>
                            <pre>N_правил = N_термов_входа1 × N_термов_входа2 × ... × N_термов_входаK</pre>
                        </div>
                        <p>Примеры:</p>
                        <ul>
                            <li>2 входа по 3 терма: 3 × 3 = 9 правил</li>
                            <li>3 входа по 3 терма: 3 × 3 × 3 = 27 правил</li>
                            <li>4 входа по 5 термов: 5⁴ = 625 правил (!)</li>
                        </ul>

                        <div className={classes.Warning}>
                            <strong>⚠️ Комбинаторный взрыв:</strong> Количество правил растёт экспоненциально!
                            Для больших систем рассмотрите декомпозицию на несколько подпроблем.
                        </div>
                    </>
                );

            case 'edit-rules':
                return (
                    <>
                        <h1>Редактирование правил</h1>
                        <p>
                            Правила определяют поведение вашей системы. Их нужно настроить в соответствии с экспертными знаниями или логикой предметной области.
                        </p>

                        <h3>Как редактировать:</h3>
                        <ol>
                            <li>Перейдите на вкладку <strong>"Таблица выходных значений"</strong> (иконка таблицы)</li>
                            <li>Найдите строку с нужной комбинацией входов</li>
                            <li>Кликните по ячейке выходного параметра</li>
                            <li>Выберите терм из выпадающего списка</li>
                            <li>Изменения сохраняются автоматически</li>
                        </ol>

                        <h3>Стратегии заполнения правил:</h3>
                        
                        <h4>1. Экспертный подход</h4>
                        <p>Заполните правила на основе знаний специалистов в предметной области:</p>
                        <ul>
                            <li>Проконсультируйтесь с экспертами</li>
                            <li>Изучите документацию, стандарты, инструкции</li>
                            <li>Используйте здравый смысл и логику</li>
                        </ul>

                        <h4>2. Монотонность</h4>
                        <p>Для многих задач выход монотонно зависит от входов:</p>
                        <ul>
                            <li>Чем выше температура → тем сильнее охлаждение</li>
                            <li>Чем больше скорость → тем сильнее торможение</li>
                            <li>Чем больше риск → тем ниже одобрение</li>
                        </ul>

                        <h4>3. Матричный подход (для 2 входов)</h4>
                        <p>Визуализируйте правила как матрицу:</p>
                        <div className={classes.Example}>
                            <table className={classes.Table}>
                                <thead>
                                    <tr>
                                        <th>Темп. ↓ / Влажность →</th>
                                        <th>Низк</th>
                                        <th>Сред</th>
                                        <th>Выс</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Холод</strong></td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td>1</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Тепло</strong></td>
                                        <td>1</td>
                                        <td>2</td>
                                        <td>3</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Жарко</strong></td>
                                        <td>2</td>
                                        <td>3</td>
                                        <td>4</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p style={{marginTop: '10px', fontSize: '13px', color: '#666'}}>
                                <strong>Легенда:</strong> 0=Выкл, 1=Слабо, 2=Средне, 3=Сильно, 4=Макс
                            </p>
                        </div>

                        <h4>4. Симметрия и закономерности</h4>
                        <ul>
                            <li>Ищите паттерны и дублируйте их для схожих ситуаций</li>
                            <li>Используйте симметрию (если она есть в задаче)</li>
                            <li>Граничные случаи обычно дают крайние выходы</li>
                        </ul>

                        <h3>Незаполненные правила:</h3>
                        <p>
                            Если оставить ячейку пустой (или выбрать пустое значение), правило не будет участвовать в выводе.
                            Это удобно для исключения невозможных или нерелевантных комбинаций.
                        </p>

                        <h3>Проверка корректности:</h3>
                        <ul>
                            <li>Все ли правила заполнены?</li>
                            <li>Нет ли противоречий? (одинаковые входы → разные выходы в разных таблицах)</li>
                            <li>Покрыты ли все важные сценарии?</li>
                            <li>Есть ли плавные переходы между соседними правилами?</li>
                        </ul>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Начните с заполнения "очевидных" правил (крайние случаи), 
                            затем интерполируйте промежуточные значения. Проверьте систему на тестовых входах.
                        </div>
                    </>
                );

            case 'rule-generation':
                return (
                    <>
                        <h1>Автоматическая генерация правил</h1>
                        <p>
                            FuzzyDB автоматически создаёт таблицу правил при добавлении входных и выходных параметров.
                        </p>

                        <h3>Когда происходит генерация:</h3>
                        <ul>
                            <li>При создании первого выходного параметра (если уже есть входные)</li>
                            <li>При добавлении нового входного значения (терма)</li>
                            <li>При добавлении нового выходного параметра</li>
                        </ul>

                        <h3>Что генерируется:</h3>
                        <p>
                            Создаются все возможные комбинации входных термов (декартово произведение). 
                            Для каждой комбинации создаётся строка в таблице с незаполненными выходными значениями.
                        </p>

                        <h3>Пример генерации:</h3>
                        <div className={classes.Example}>
                            <p><strong>Входные параметры:</strong></p>
                            <ul>
                                <li>Температура: "Холодно", "Тепло"</li>
                                <li>Свет: "Темно", "Светло"</li>
                            </ul>
                            <p><strong>Выходной параметр:</strong></p>
                            <ul>
                                <li>Комфорт: "Плохо", "Нормально", "Хорошо"</li>
                            </ul>
                            <p><strong>Сгенерированные правила (2 × 2 = 4):</strong></p>
                            <ol>
                                <li>Холодно + Темно → ?</li>
                                <li>Холодно + Светло → ?</li>
                                <li>Тепло + Темно → ?</li>
                                <li>Тепло + Светло → ?</li>
                            </ol>
                        </div>

                        <h3>Регенерация при изменениях:</h3>
                        
                        <h4>Добавление терма к входному параметру:</h4>
                        <p>
                            Автоматически создаются новые правила для всех комбинаций с новым термом.
                            Существующие правила сохраняются.
                        </p>
                        <p><em>Пример:</em> Если к "Температуре" добавить "Жарко", система создаст ещё 2 правила: "Жарко + Темно", "Жарко + Светло".</p>

                        <h4>Удаление терма входа:</h4>
                        <p>
                            Удаляются все правила, содержащие этот терм. Это может существенно сократить таблицу.
                        </p>

                        <h4>Удаление входного параметра:</h4>
                        <p>
                            Таблица пересоздаётся полностью для оставшихся параметров. 
                            <strong>Все ранее заполненные правила теряются!</strong>
                        </p>

                        <h4>Добавление выходного параметра:</h4>
                        <p>
                            К существующей таблице добавляется новый столбец с незаполненными ячейками.
                        </p>

                        <div className={classes.Warning}>
                            <strong>⚠️ Критически важно:</strong> Удаление входных параметров или их термов может привести к потере настроенных правил.
                            Перед удалением убедитесь, что вы сохранили экспорт проблемы!
                        </div>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Продумайте структуру входов и выходов заранее. 
                            Добавление новых термов безопасно, но изменение структуры требует повторной настройки правил.
                        </div>
                    </>
                );

            case 'evaluation':
                return (
                    <>
                        <h1>Вычисление результата (нечёткий вывод)</h1>
                        <p>
                            На вкладке <strong>"Нечёткий вывод"</strong> (иконка калькулятора) вы можете получить результаты работы вашей системы для конкретных входных значений.
                        </p>

                        <h3>Как использовать:</h3>
                        <ol>
                            <li>Убедитесь, что система настроена:
                                <ul>
                                    <li>Созданы входные параметры с термами</li>
                                    <li>Созданы выходные параметры с термами</li>
                                    <li>Заполнена таблица правил</li>
                                </ul>
                            </li>
                            <li>Перейдите на вкладку "Нечёткий вывод"</li>
                            <li>В секции "Входные значения" введите конкретные числовые значения для каждого входного параметра</li>
                            <li>Выберите метод дефаззификации (по умолчанию Центроид/Centroid)</li>
                            <li>Нажмите кнопку <strong>"Вычислить"</strong></li>
                            <li>Результаты появятся в секции "Результаты"</li>
                        </ol>

                        <h3>Входная форма:</h3>
                        <p>
                            Для каждого входного параметра отображается:
                        </p>
                        <ul>
                            <li>Название параметра</li>
                            <li>Диапазон [min, max]</li>
                            <li>Поле ввода числового значения</li>
                            <li>Значение по умолчанию — середина диапазона</li>
                        </ul>

                        <h3>Методы дефаззификации:</h3>
                        <p>
                            Выберите один из 5 доступных методов (подробнее см. раздел "Методы дефаззификации"):
                        </p>
                        <div className={classes.Warning}>
                            <strong>⚠️ Внимание:</strong> В текущей версии приложения реализован только метод <strong>Центроид (Centroid)</strong>.
                            Остальные методы (Биссектриса, MOM, SOM, LOM) будут добавлены в будущих обновлениях.
                        </div>
                        <ul>
                            <li><strong>Центроид (Centroid)</strong> — метод центра тяжести (рекомендуется по умолчанию) ✅ <em>Реализован</em></li>
                            <li><strong>Биссектриса (Bisector)</strong> — метод медианы площади <em>(планируется)</em></li>
                            <li><strong>MOM</strong> — метод средних максимумов <em>(планируется)</em></li>
                            <li><strong>SOM</strong> — метод наименьшего максимума <em>(планируется)</em></li>
                            <li><strong>LOM</strong> — метод наибольшего максимума <em>(планируется)</em></li>
                        </ul>

                        <h3>Результаты:</h3>
                        <p>
                            После вычисления отображается:
                        </p>
                        <ul>
                            <li><strong>Чёткие выходные значения</strong> — числовой результат для каждого выходного параметра</li>
                            <li><strong>График агрегированной функции принадлежности</strong> — визуализация нечёткого множества выхода</li>
                            <li><strong>Метка дефаззифицированного значения</strong> на графике</li>
                        </ul>

                        <h3>Интерпретация результата:</h3>
                        <div className={classes.Example}>
                            <p><strong>Пример:</strong> Управление кондиционером</p>
                            <ul>
                                <li>Входы: Температура = 28°C, Влажность = 70%</li>
                                <li>Метод: Центроид (Centroid)</li>
                                <li>Результат: Мощность = 67.3%</li>
                            </ul>
                            <p>
                                <strong>Интерпретация:</strong> При температуре 28°C и влажности 70% система рекомендует установить мощность кондиционера на уровне 67.3%.
                            </p>
                        </div>

                        <h3>Экспериментирование:</h3>
                        <ul>
                            <li>Изменяйте входные значения и наблюдайте за изменением результата</li>
                            <li>Попробуйте разные методы дефаззификации</li>
                            <li>Проверьте граничные и типичные случаи</li>
                            <li>Убедитесь, что результаты соответствуют ожиданиям</li>
                        </ul>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Если результат не соответствует ожиданиям, 
                            проверьте базу правил и функции принадлежности. Используйте "Детальный просмотр" для анализа процесса вывода.
                        </div>
                    </>
                );

            case 'defuzzification':
                return (
                    <>
                        <h1>Методы дефаззификации</h1>
                        <p>
                            Дефаззификация — это преобразование нечёткого множества (результата аккумуляции) в чёткое число.
                        </p>

                        <div className={classes.Info}>
                            <strong>ℹ️ Важно:</strong> В текущей версии приложения реализован только метод <strong>Центроид (Centroid)</strong>.
                            Ниже приведено описание всех методов для справки и понимания различий между подходами.
                        </div>

                        <h3>Методы дефаззификации:</h3>
                        
                        <h4>1. Центроид (Centroid) — Метод центра тяжести</h4>
                        <p><strong>Самый распространённый метод.</strong></p>
                        <p>Формула:</p>
                        <div className={classes.Formula}>
                            <pre>{`          b
x* = ∫ x · μ(x) dx
          a
────────────────
          b
      ∫ μ(x) dx
          a`}</pre>
                        </div>
                        <p>Вычисляет центр площади под кривой μ(x).</p>
                        <p><strong>Преимущества:</strong> Учитывает всю форму функции, даёт плавные результаты.</p>
                        <p><strong>Недостатки:</strong> Вычислительно затратен.</p>

                        <h4>2. Биссектриса (Bisector) — Метод медианы</h4>
                        <p>Точка x*, делящая площадь под кривой на две равные части:</p>
                        <div className={classes.Formula}>
                            <pre>{`  x*                b
∫ μ(x)dx = ∫ μ(x)dx
  a                x*`}</pre>
                        </div>
                        <p><strong>Преимущества:</strong> Устойчив к выбросам.</p>
                        <p><strong>Недостатки:</strong> Требует итеративного поиска.</p>

                        <h4>3. Метод средних максимумов (MOM — Mean of Maximum)</h4>
                        <p>Среднее значений x, где μ(x) максимальна:</p>
                        <div className={classes.Formula}>
                            <pre>{`x* = среднее { x | μ(x) = max μ }`}</pre>
                        </div>
                        <p><strong>Преимущества:</strong> Быстрый, интуитивный.</p>
                        <p><strong>Недостатки:</strong> Игнорирует большую часть функции.</p>

                        <h4>4. Метод наименьшего максимума (SOM — Smallest of Maximum)</h4>
                        <p>Минимальное x среди точек с максимальной принадлежностью:</p>
                        <div className={classes.Formula}>
                            <pre>{`x* = min { x | μ(x) = max μ }`}</pre>
                        </div>
                        <p><strong>Когда использовать:</strong> Если нужен консервативный (меньший) результат.</p>

                        <h4>5. Метод наибольшего максимума (LOM — Largest of Maximum)</h4>
                        <p>Максимальное x среди точек с максимальной принадлежностью:</p>
                        <div className={classes.Formula}>
                            <pre>{`x* = max { x | μ(x) = max μ }`}</pre>
                        </div>
                        <p><strong>Когда использовать:</strong> Если нужен агрессивный (больший) результат.</p>

                        <h3>Визуальное сравнение методов:</h3>
                        <div className={classes.CodeBlock}>
                            <DefuzzificationMethodsCanvas />
                        </div>
                        <p style={{marginTop: '10px', fontSize: '14px', color: '#abb2bf'}}>
                            <strong>Примечание:</strong> На графике показаны позиции разных методов дефаззификации.
                            В текущей версии приложения реализован только метод <strong>Центроид</strong>.
                        </p>

                        <h3>Выбор метода:</h3>
                        <table className={classes.Table}>
                            <thead>
                                <tr>
                                    <th>Метод</th>
                                    <th>Применение</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Центроид (Centroid)</td>
                                    <td>Общего назначения, сбалансированный, плавный</td>
                                </tr>
                                <tr>
                                    <td>Биссектриса (Bisector)</td>
                                    <td>Альтернатива центроиду, устойчив к искажениям</td>
                                </tr>
                                <tr>
                                    <td>Метод средних максимумов (MOM)</td>
                                    <td>Когда важна "наиболее вероятная" зона</td>
                                </tr>
                                <tr>
                                    <td>Метод наименьшего максимума (SOM)</td>
                                    <td>Консервативные оценки, минимизация рисков</td>
                                </tr>
                                <tr>
                                    <td>Метод наибольшего максимума (LOM)</td>
                                    <td>Агрессивные оценки, максимизация эффекта</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className={classes.Tip}>
                            <strong>💡 Рекомендация:</strong> Начните с метода Центроид — он наиболее универсален.
                            Если результаты требуют корректировки, попробуйте другие методы для сравнения.
                        </div>
                    </>
                );

            case 'detailed-view':
                return (
                    <>
                        <h1>Детальный просмотр процесса вывода</h1>
                        <p>
                            Вкладка "Детальный просмотр" (доступна через расширенный режим) позволяет пошагово отследить все этапы нечёткого вывода.
                        </p>

                        <h3>Что отображается:</h3>
                        
                        <h4>1. Фаззификация входов</h4>
                        <p>Для каждого входа показывается:</p>
                        <ul>
                            <li>Введённое чёткое значение</li>
                            <li>График функций принадлежности всех термов параметра</li>
                            <li>Вертикальная линия на графике, показывающая значение входа</li>
                            <li>Степени принадлежности входа к каждому терму (μ-значения)</li>
                        </ul>

                        <h4>2. Активированные правила</h4>
                        <p>Список правил, которые "сработали" (имеют ненулевую степень активации):</p>
                        <ul>
                            <li>Комбинация входных термов</li>
                            <li>Степень активации правила (минимум из μ входов)</li>
                            <li>Выходной терм, определённый правилом</li>
                        </ul>

                        <h4>3. Агрегация выхода</h4>
                        <p>Для каждого выходного параметра:</p>
                        <ul>
                            <li>График агрегированной функции принадлежности</li>
                            <li>Наложение "обрезанных" термов (по степеням активации правил)</li>
                            <li>Итоговая кривая (максимум по всем активированным термам)</li>
                        </ul>

                        <h4>4. Дефаззификация</h4>
                        <ul>
                            <li>Метод дефаззификации</li>
                            <li>Вычисленное чёткое значение</li>
                            <li>Метка на графике агрегированной функции</li>
                        </ul>

                        <h3>Как использовать для отладки:</h3>
                        
                        <h4>Проверка фаззификации:</h4>
                        <ul>
                            <li>Убедитесь, что входное значение попадает в правильные термы</li>
                            <li>Проверьте, что степени принадлежности логичны</li>
                            <li>Если μ = 0 для всех термов — значение вне диапазона!</li>
                        </ul>

                        <h4>Анализ активированных правил:</h4>
                        <ul>
                            <li>Какие правила сработали?</li>
                            <li>Соответствуют ли они ожиданиям?</li>
                            <li>Нет ли конфликтующих правил (одинаковые входы → разные выходы с высокими весами)?</li>
                        </ul>

                        <h4>Оценка агрегации:</h4>
                        <ul>
                            <li>Адекватна ли форма агрегированной функции?</li>
                            <li>Ожидали ли вы такое распределение?</li>
                            <li>Логично ли расположена точка дефаззификации?</li>
                        </ul>

                        <h3>Пример диагностики проблемы:</h3>
                        <div className={classes.Example}>
                            <p><strong>Проблема:</strong> Результат всегда близок к среднему, не реагирует на изменения входов.</p>
                            <p><strong>Диагностика через детальный просмотр:</strong></p>
                            <ol>
                                <li><strong>Фаззификация:</strong> Степени принадлежности размазаны по многим термам (широкие функции принадлежности)</li>
                                <li><strong>Активация:</strong> Одновременно срабатывают много правил с близки��и весами</li>
                                <li><strong>Агрегация:</strong> Агрегированная функция имеет широкое плато по всему диапазону</li>
                            </ol>
                            <p><strong>Решение:</strong> Сделать функции принадлежности более узкими (меньше перекрытие), чтобы активировалось меньше правил одновременно.</p>
                        </div>

                        <div className={classes.Tip}>
                            <strong>💡 Совет:</strong> Используйте детальный просмотр при настройке новой системы
                            или если результаты вас не устраивают. Это лучший способ понять, как работает ваша система.
                        </div>
                    </>
                );

            case 'scenario-complete':
                return (
                    <>
                        <h1>Полный сценарий работы с приложением</h1>
                        <p>
                            Пошаговая инструкция: от создания проблемы до получения результатов нечёткого вывода.
                        </p>

                        <h3>ШАГ 1: Постановка задачи</h3>
                        <p><strong>Пример задачи:</strong> Разработать систему управления скоростью вентилятора охлаждения в зависимости от температуры процессора и загрузки системы.</p>

                        <h3>ШАГ 2: Создание проблемы</h3>
                        <ol>
                            <li>Запустите приложение</li>
                            <li>Нажмите "+" в правом меню</li>
                            <li>Заполните форму:
                                <ul>
                                    <li><strong>Название:</strong> "Управление вентилятором ПК"</li>
                                    <li><strong>Описание:</strong> "Автоматическая регулировка скорости вентилятора"</li>
                                    <li><strong>Финальная:</strong> ✓ (отметьте)</li>
                                </ul>
                            </li>
                            <li>Сохраните</li>
                            <li>Откройте созданную проблему (кликните по карточке)</li>
                        </ol>

                        <h3>ШАГ 3: Настройка входных параметров</h3>
                        
                        <h4>3.1. Создание первого входного параметра: "Температура CPU"</h4>
                        <ol>
                            <li>Перейдите на вкладку "Входные параметры" (стрелка вправо)</li>
                            <li>Нажмите "+" в правом меню</li>
                            <li>Раскройте карточку параметра</li>
                            <li>Измените название на <strong>"Температура CPU"</strong></li>
                            <li>Установите диапазон: Start = <strong>30</strong>, End = <strong>90</strong> (°C)</li>
                            <li>Добавьте 4 термаНажмите "+" четыре раза</li>
                            <li>Переименуйте термы:
                                <ul>
                                    <li>"Холодный"</li>
                                    <li>"Прохладный"</li>
                                    <li>"Тёплый"</li>
                                    <li>"Горячий"</li>
                                </ul>
                            </li>
                            <li>Проверьте функции принадлежности на графике (автоматически созданы)</li>
                        </ol>

                        <h4>3.2. Создание второго входного параметра: "Загрузка CPU"</h4>
                        <ol>
                            <li>Нажмите "+" ещё раз (добавить второй параметр)</li>
                            <li>Название: <strong>"Загрузка CPU"</strong></li>
                            <li>Диапазон: Start = <strong>0</strong>, End = <strong>100</strong> (%)</li>
                            <li>Добавьте 3 терма:
                                <ul>
                                    <li>"Низкая"</li>
                                    <li>"Средняя"</li>
                                    <li>"Высокая"</li>
                                </ul>
                            </li>
                        </ol>

                        <h3>ШАГ 4: Настройка выходного параметра</h3>
                        <ol>
                            <li>Перейдите на вкладку "Выходные параметры" (стрелка влево)</li>
                            <li>Нажмите "+"</li>
                            <li>Название: <strong>"Скорость вентилятора"</strong></li>
                            <li>Диапазон: Start = <strong>0</strong>, End = <strong>100</strong> (%)</li>
                            <li>Добавьте 5 термов:
                                <ul>
                                    <li>"Минимум" (~0-20%)</li>
                                    <li>"Слабая" (~15-40%)</li>
                                    <li>"Средняя" (~35-65%)</li>
                                    <li>"Высокая" (~60-85%)</li>
                                    <li>"Максимум" (~80-100%)</li>
                                </ul>
                            </li>
                        </ol>

                        <h3>ШАГ 5: Настройка таблицы правил</h3>
                        <ol>
                            <li>Перейдите на вкладку "Таблица выходных значений" (иконка таблицы)</li>
                            <li>Таблица содержит 4 × 3 = 12 правил (автоматически сгенерированы)</li>
                            <li>Заполните правила по логике:
                                <table className={classes.Table} style={{fontSize: '0.85em'}}>
                                    <thead>
                                        <tr>
                                            <th>Температура</th>
                                            <th>Загрузка</th>
                                            <th>→ Скорость</th>
                                            <th>Логика</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td>Холодный</td><td>Низкая</td><td>Минимум</td><td>Холодно и простой</td></tr>
                                        <tr><td>Холодный</td><td>Средняя</td><td>Слабая</td><td>Холодно, но загружен</td></tr>
                                        <tr><td>Холодный</td><td>Высокая</td><td>Средняя</td><td>Холодно, но пиковая нагрузка</td></tr>
                                        <tr><td>Прохладный</td><td>Низкая</td><td>Слабая</td><td>Норма, простой</td></tr>
                                        <tr><td>Прохладный</td><td>Средняя</td><td>Средняя</td><td>Норма, средняя нагрузка</td></tr>
                                        <tr><td>Прохладный</td><td>Высокая</td><td>Высокая</td><td>Норма, пик</td></tr>
                                        <tr><td>Тёплый</td><td>Низкая</td><td>Средняя</td><td>Тепло, простой</td></tr>
                                        <tr><td>Тёплый</td><td>Средняя</td><td>Высокая</td><td>Тепло, загружен</td></tr>
                                        <tr><td>Тёплый</td><td>Высокая</td><td>Максимум</td><td>Тепло, пик</td></tr>
                                        <tr><td>Горячий</td><td>Низкая</td><td>Высокая</td><td>Критично даже без нагрузки</td></tr>
                                        <tr><td>Горячий</td><td>Средняя</td><td>Максимум</td><td>Критично, охладить!</td></tr>
                                        <tr><td>Горячий</td><td>Высокая</td><td>Максимум</td><td>Аварийный режим</td></tr>
                                    </tbody>
                                </table>
                            </li>
                        </ol>

                        <h3>ШАГ 6: Тестирование системы</h3>
                        <ol>
                            <li>Перейдите на вкладку "Нечёткий вывод" (калькулятор)</li>
                            <li>Введите тестовые входы:
                                <ul>
                                    <li>Температура CPU = <strong>65°C</strong></li>
                                    <li>Загрузка CPU = <strong>45%</strong></li>
                                </ul>
                            </li>
                            <li>Выберите метод: <strong>Центроид</strong></li>
                            <li>Нажмите <strong>"Вычислить"</strong></li>
                            <li>Результат: Скорость ~ 55-60% (в зависимости от функций принадлежности)</li>
                        </ol>

                        <h3>ШАГ 7: Проверка других сценариев</h3>
                        <p>Протестируйте граничные и типичные случаи:</p>
                        <ul>
                            <li>T=35°C, Load=10% → ожидается Минимум (~10-15%)</li>
                            <li>T=85°C, Load=90% → ожидается Максимум (~95-100%)</li>
                            <li>T=50°C, Load=50% → ожидается Средняя (~50-55%)</li>
                        </ul>

                        <h3>ШАГ 8: Экспорт конфигурации</h3>
                        <ol>
                            <li>Вернитесь к списку проблем (кликните на корень в breadcrumb)</li>
                            <li>На карточке "Управление вентилятором ПК" нажмите иконку экспорта</li>
                            <li>Сохраните файл <code>fan_control.json</code></li>
                            <li>Теперь вы можете импортировать эту систему на другом устройстве</li>
                        </ol>

                        <div className={classes.Success}>
                            <strong>✅ Готово!</strong> Вы создали и протестировали полнофункциональную систему нечёткого вывода.
                        </div>
                    </>
                );

            case 'scenario-simple':
                return (
                    <>
                        <h1>Простой пример: Чаевые в ресторане</h1>
                        <p>
                            Классический пример системы нечёткого вывода — определение размера чаевых на основании качества обслуживания и еды.
                        </p>

                        <h3>Постановка задачи:</h3>
                        <p>
                            Разработать систему, которая рекомендует размер чаевых (в процентах от счёта) на основе двух факторов:
                        </p>
                        <ul>
                            <li>Качество обслуживания (Service)</li>
                            <li>Качество еды (Food)</li>
                        </ul>

                        <h3>Реализация в FuzzyDB:</h3>
                        
                        <h4>1. Создайте проблему:</h4>
                        <ul>
                            <li>Название: "Чаевые в ресторане"</li>
                            <li>Финальная: ✓</li>
                        </ul>

                        <h4>2. Входные параметры:</h4>
                        
                        <p><strong>Параметр 1: "Качество обслуживания"</strong></p>
                        <ul>
                            <li>Диапазон: [0, 10]</li>
                            <li>Термы:
                                <ul>
                                    <li>"Плохое" (0-4)</li>
                                    <li>"Среднее" (3-7)</li>
                                    <li>"Отличное" (6-10)</li>
                                </ul>
                            </li>
                        </ul>

                        <p><strong>Параметр 2: "Качество еды"</strong></p>
                        <ul>
                            <li>Диапазон: [0, 10]</li>
                            <li>Термы:
                                <ul>
                                    <li>"Невкусная" (0-4)</li>
                                    <li>"Нормальная" (3-7)</li>
                                    <li>"Восхитительная" (6-10)</li>
                                </ul>
                            </li>
                        </ul>

                        <h4>3. Выходной параметр:</h4>
                        
                        <p><strong>"Размер чаевых"</strong></p>
                        <ul>
                            <li>Диапазон: [5, 25] (%)</li>
                            <li>Термы:
                                <ul>
                                    <li>"Минимум" (5-10%)</li>
                                    <li>"Среднее" (10-18%)</li>
                                    <li>"Щедрые" (18-25%)</li>
                                </ul>
                            </li>
                        </ul>

                        <h4>4. Таблица правил (3 × 3 = 9 правил):</h4>
                        <table className={classes.Table}>
                            <thead>
                                <tr>
                                    <th>Обслуживание ↓</th>
                                    <th>Еда: Невкусная</th>
                                    <th>Еда: Нормальная</th>
                                    <th>Еда: Восхитительная</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Плохое</strong></td>
                                    <td>Минимум (5%)</td>
                                    <td>Минимум (7%)</td>
                                    <td>Среднее (12%)</td>
                                </tr>
                                <tr>
                                    <td><strong>Среднее</strong></td>
                                    <td>Минимум (8%)</td>
                                    <td>Среднее (15%)</td>
                                    <td>Щедрые (20%)</td>
                                </tr>
                                <tr>
                                    <td><strong>Отличное</strong></td>
                                    <td>Среднее (12%)</td>
                                    <td>Щедрые (20%)</td>
                                    <td>Щедрые (25%)</td>
                                </tr>
                            </tbody>
                        </table>

                        <h4>5. Тестовые сценарии:</h4>
                        <table className={classes.Table}>
                            <thead>
                                <tr>
                                    <th>Сценарий</th>
                                    <th>Обслуживание</th>
                                    <th>Еда</th>
                                    <th>Ожидаемые чаевые</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Всё плохо</td>
                                    <td>2</td>
                                    <td>2</td>
                                    <td>~6%</td>
                                </tr>
                                <tr>
                                    <td>Средне</td>
                                    <td>5</td>
                                    <td>5</td>
                                    <td>~15%</td>
                                </tr>
                                <tr>
                                    <td>Отлично!</td>
                                    <td>9</td>
                                    <td>9</td>
                                    <td>~23-25%</td>
                                </tr>
                                <tr>
                                    <td>Смешанно</td>
                                    <td>7</td>
                                    <td>4</td>
                                    <td>~12-14%</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className={classes.Tip}>
                            <strong>💡 Упражнение:</strong> Создайте эту систему самостоятельно и поэкспериментируйте с разными входными значениями.
                            Попробуйте изменить термы или правила под свои предпочтения.
                        </div>
                    </>
                );

            case 'scenario-complex':
                return (
                    <>
                        <h1>Сложная иерархия: Оценка рисков проекта</h1>
                        <p>
                            Пример использования иерархии проблем для структурирования сложной многоуровневой системы принятия решений.
                        </p>

                        <h3>Структура иерархии:</h3>
                        <div className={classes.CodeBlock}>
                            <pre>{`📁 Оценка рисков ИТ-проекта
├─ 🎯 Технический риск (финальная)
│  Входы: Сложность, Новизна технологий
│  Выход: ТехнРиск [0-100]
│
├─ 🎯 Финансовый риск (финальная)
│  Входы: Бюджет, Затраты на персонал
│  Выход: ФинРиск [0-100]
│
├─ 🎯 Временной риск (финальная)
│  Входы: Срок, Размер команды
│  Выход: ВремРиск [0-100]
│
└─ 🎯 Итоговая оценка проекта (финальная)
   Входы: ТехнРиск, ФинРиск, ВремРиск
   Выход: Решение (Одобрить/Доработать/Отклонить)`}</pre>
                        </div>

                        <h3>Реализация:</h3>
                        
                        <h4>Уровень 0: Корневая проблема</h4>
                        <ol>
                            <li>Создайте нефинальную проблему "Оценка рисков ИТ-проекта"</li>
                            <li>Финальная: ✗ (это контейнер)</li>
                        </ol>

                        <h4>Уровень 1: Частные оценки рисков</h4>
                        
                        <p><strong>1.1. Проблема "Технический риск"</strong></p>
                        <ul>
                            <li>Входы:
                                <ul>
                                    <li>"Сложность архитектуры" [0, 10]: Простая, Средняя, Сложная</li>
                                    <li>"Новизна технологий" [0, 10]: Известные, Частично новые, Инновационные</li>
                                </ul>
                            </li>
                            <li>Выход: "ТехнРиск" [0, 100]: Низкий, Средний, Высокий</li>
                            <li>Правила: 3×3=9 (низкая сложность + известные технологии → Низкий риск)</li>
                        </ul>

                        <p><strong>1.2. Проблема "Финансовый риск"</strong></p>
                        <ul>
                            <li>Входы:
                                <ul>
                                    <li>"Общий бюджет" [0, 10]: Малый, Средний, Большой</li>
                                    <li>"Затраты на персонал" [0, 10]: Низкие, Умеренные, Высокие</li>
                                </ul>
                            </li>
                            <li>Выход: "ФинРиск" [0, 100]: Низкий, Средний, Высокий</li>
                        </ul>

                        <p><strong>1.3. Проблема "Временной риск"</strong></p>
                        <ul>
                            <li>Входы:
                                <ul>
                                    <li>"Плановый срок" [0, 10]: Долгий, Средний, Короткий</li>
                                    <li>"Размер команды" [0, 10]: Маленькая, Средняя, Большая</li>
                                </ul>
                            </li>
                            <li>Выход: "ВремРиск" [0, 100]: Низкий, Средний, Высокий</li>
                        </ul>

                        <h4>Уровень 2: Итоговое решение</h4>
                        
                        <p><strong>Проблема "Итоговая оценка проекта"</strong></p>
                        <ul>
                            <li>Входы (результаты предыдущего уровня):
                                <ul>
                                    <li>"ТехнРиск" [0, 100]: Низкий, Средний, Высокий</li>
                                    <li>"ФинРиск" [0, 100]: Низкий, Средний, Высокий</li>
                                    <li>"ВремРиск" [0, 100]: Низкий, Средний, Высокий</li>
                                </ul>
                            </li>
                            <li>Выход: "Решение" [0, 100]: Одобрить (0-40), Доработать (35-65), Отклонить (60-100)</li>
                            <li>Правила: 3×3×3=27 правил</li>
                        </ul>

                        <h3>Пример заполнения итоговых правил:</h3>
                        <table className={classes.Table} style={{fontSize: '0.8em'}}>
                            <thead>
                                <tr>
                                    <th>ТехнРиск</th>
                                    <th>ФинРиск</th>
                                    <th>ВремРиск</th>
                                    <th>→ Решение</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Низкий</td><td>Низкий</td><td>Низкий</td><td>Одобрить</td></tr>
                                <tr><td>Низкий</td><td>Низкий</td><td>Средний</td><td>Одобрить</td></tr>
                                <tr><td>Низкий</td><td>Средний</td><td>Средний</td><td>Доработать</td></tr>
                                <tr><td>Средний</td><td>Средний</td><td>Средний</td><td>Доработать</td></tr>
                                <tr><td>Высокий</td><td>Высокий</td><td>Высокий</td><td>Отклонить</td></tr>
                                <tr><td colSpan={4}>...и так далее для всех 27 комбинаций</td></tr>
                            </tbody>
                        </table>

                        <h3>Использование:</h3>
                        <ol>
                            <li><strong>Этап 1:</strong> Оцените каждый аспект
                                <ul>
                                    <li>Откройте "Технический риск", введите сложность=7, новизна=8 → получите ТехнРиск=75</li>
                                    <li>Откройте "Финансовый риск", введите бюджет=5, затраты=4 → ФинРиск=40</li>
                                    <li>Откройте "Временной риск", введите срок=3, команда=6 → ВремРиск=50</li>
                                </ul>
                            </li>
                            <li><strong>Этап 2:</strong> Получите итоговое решение
                                <ul>
                                    <li>Откройте "Итоговая оценка"</li>
                                    <li>Введите ТехнРиск=75, ФинРиск=40, ВремРиск=50</li>
                                    <li>Результат: Решение ~ 55 ("Доработать")</li>
                                </ul>
                            </li>
                        </ol>

                        <h3>Преимущества иерархического подхода:</h3>
                        <ul>
                            <li>✅ Декомпозиция сложности (27 правил вместо потенциальных 3⁶=729)</li>
                            <li>✅ Модульность (каждая подпроблема независима)</li>
                            <li>✅ Понятность (эксперты могут настраивать отдельные аспекты)</li>
                            <li>✅ Масштабируемость (легко добавить новые факторы)</li>
                            <li>✅ Переиспользование (подпроблемы можно экспортировать и использовать в других проектах)</li>
                        </ul>

                        <div className={classes.Tip}>
                            <strong>💡 Лучшая практика:</strong> Используйте иерархию для сложных систем с 5+ входами.
                            Группируйте связанные параметры в отдельные подпроблемы, затем агрегируйте результаты.
                        </div>
                    </>
                );

            case 'intro':
            default:
                return (
                    <>
                        <h1>Добро пожаловать в FuzzyDB</h1>
                        <p>
                            Эта справка поможет вам разобраться во всех возможностях приложения для проектирования систем нечёткого логического вывода.
                        </p>

                        <h3>С чего начать:</h3>
                        <ol>
                            <li><strong>Изучите ключевые понятия</strong> — ознакомьтесь с терминологией нечёткой логики</li>
                            <li><strong>Создайте первую проблему</strong> — следуйте пошаговой инструкции</li>
                            <li><strong>Настройте параметры</strong> — определите входы, выходы и их нечёткие термы</li>
                            <li><strong>Заполните таблицу правил</strong> — опишите логику вашей системы</li>
                            <li><strong>Получите результаты</strong> — вычислите выходные значения</li>
                        </ol>

                        <h3>Структура справки:</h3>
                        <p>Используйте навигацию слева для перехода между разделами:</p>
                        <ul>
                            <li><strong>Введение</strong> — общая информация и термины</li>
                            <li><strong>Начало работы</strong> — создание проблем, импорт/экспорт</li>
                            <li><strong>Входные параметры</strong> — настройка входов системы</li>
                            <li><strong>Выходные параметры</strong> — настройка выходов</li>
                            <li><strong>Таблица правил</strong> — создание базы знаний</li>
                            <li><strong>Нечёткий вывод</strong> — получение результатов</li>
                            <li><strong>Сценарии использования</strong> — подробные примеры</li>
                        </ul>

                        <div className={classes.Welcome}>
                            <h3>🚀 Быстрый старт</h3>
                            <p>Если хотите сразу приступить к работе, перейдите к разделу:</p>
                            <button className={classes.QuickLink} onClick={() => setActiveSection('scenario-complete')}>
                                Полный сценарий работы →
                            </button>
                        </div>

                        <div className={classes.Info}>
                            <strong>ℹ️ Справка:</strong> Чтобы закрыть эту страницу и вернуться к приложению, 
                            нажмите кнопку закрытия в правом верхнем углу.
                        </div>
                    </>
                );
        }
    };

    const renderNavSection = (section: Section, level: number = 0) => {
        const hasSubsections = section.subsections && section.subsections.length > 0;
        
        return (
            <div key={section.id} style={{ marginLeft: `${level * 12}px` }}>
                <div
                    className={`${classes.NavItem} ${activeSection === section.id ? classes.ActiveNavItem : ''}`}
                    onClick={() => setActiveSection(section.id)}
                >
                    {section.title}
                </div>
                {hasSubsections && section.subsections!.map(sub => renderNavSection(sub, level + 1))}
            </div>
        );
    };

    return (
        <div className={classes.HelpPage}>
            <aside className={classes.Sidebar}>
                <div className={classes.SidebarHeader}>
                    <h2>Содержание</h2>
                </div>
                <nav className={classes.Navigation}>
                    {sections.map(section => renderNavSection(section))}
                </nav>
            </aside>
            <main className={classes.Content}>
                <button className={classes.CloseButton} onClick={onClose} title="Закрыть справку">
                    <BsXLg />
                </button>
                <div className={classes.ContentInner}>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default HelpPage;
