# Анализ дефаззификации методом центроида

## Обнаруженные различия между Frontend и Backend реализациями

### 1. **КРИТИЧЕСКАЯ ПРОБЛЕМА: Различное количество точек интегрирования**

#### Frontend (TypeScript):
```typescript
const resolution = 100;
const step = (outParam.end - outParam.start) / resolution;

for (let x = outParam.start; x <= outParam.end; x += step) {
    // вычисления...
    fuzzySet.push({ x, mu });
}
```

**Проблема:** Условие `x <= outParam.end` с использованием `x += step` может привести к **непредсказуемому** количеству итераций из-за погрешности чисел с плавающей точкой. Фактическое количество точек может быть 100, 101, 102 или даже больше в зависимости от конкретных значений start и end.

#### Backend (Rust):
```rust
let step = (end - start) / (resolution as f32);
let mut numerator = 0.0_f32;
let mut denominator = 0.0_f32;

for i in 0..=resolution {  // ТОЧНО resolution+1 итераций (101 при resolution=100)
    let x = start + (i as f32) * step;
    let mu = aggregated_membership_at(x, clipped_sets);
    numerator += x * mu;
    denominator += mu;
}
```

**Корректно:** Используется цикл по индексу `i in 0..=resolution`, что гарантирует ровно **101 точку** при resolution=100.

### 2. Различная точность чисел

- **Frontend:** `number` (IEEE 754 double precision, 64 bit, ~15-17 значащих цифр)
- **Backend:** `f32` (IEEE 754 single precision, 32 bit, ~6-9 значащих цифр)

Это может привести к небольшим расхождениям в результатах, особенно при накоплении погрешности.

### 3. Различия в функции принадлежности

#### Frontend:
```typescript
const trapezoidalMembership = (x: number, a: number, b: number, c: number, d: number): number => {
    const epsilon = 1e-6;
    
    if (x < a - epsilon || x > d + epsilon) return 0;
    
    // Специальная обработка для a = b (первый терм)
    if (Math.abs(a - b) < epsilon) {
        if (x <= c + epsilon) return 1;
        if (Math.abs(c - d) < epsilon) return 1;
        return (d - x) / (d - c);
    }
    
    // Специальная обработка для c = d (последний терм)
    if (Math.abs(c - d) < epsilon) {
        if (x < b - epsilon) return (x - a) / (b - a);
        return 1;
    }
    
    // Обычный случай
    if (x < b) return (x - a) / (b - a);
    if (x <= c) return 1;
    return (d - x) / (d - c);
};
```

#### Backend:
```rust
pub fn calculate_membership(x: f32, a: f32, b: f32, c: f32, d: f32, is_triangle: bool) -> f32 {
    let (b, c) = if is_triangle { (b, b) } else { (b, c) };

    if x <= a {
        0.0
    } else if x < b {
        (x - a) / (b - a)
    } else if x <= c {
        1.0
    } else if x < d {
        (d - x) / (d - c)
    } else {
        0.0
    }
}
```

**Различия:**
- Frontend использует `epsilon` (1e-6) для нечетких сравнений
- Backend использует строгие сравнения
- Frontend имеет специальную обработку для краевых термов (a=b, c=d)
- Backend НЕ обрабатывает эти случаи специально (если только не установлен флаг `is_triangle`)

### 4. Обработка граничных точек

#### Frontend:
- `x <= outParam.end` включает конечную точку
- `if (x < a - epsilon || x > d + epsilon) return 0;` - с учетом epsilon

#### Backend:
- `if x <= a { 0.0 }` - строгое сравнение без epsilon
- Последняя точка: `x = start + resolution * step = start + (end-start) = end` - точно включена

## Рекомендации по исправлению

### Вариант 1: Исправить Frontend (рекомендуется)

Изменить цикл интегрирования на основе индекса:

```typescript
const resolution = 100;
const step = (outParam.end - outParam.start) / resolution;

// ИЗМЕНИТЬ С:
// for (let x = outParam.start; x <= outParam.end; x += step)

// НА:
for (let i = 0; i <= resolution; i++) {
    const x = outParam.start + i * step;
    let mu = 0;
    // ... остальной код
    fuzzySet.push({ x, mu });
}
```

Это гарантирует ровно 101 точку, как в Backend.

### Вариант 2: Синхронизировать функции принадлежности

Можно также добавить epsilon в Backend или убрать из Frontend для единообразия, но это менее критично.

### Вариант 3: Использовать двойную точность в Backend (f64)

Изменить `f32` на `f64` в Rust для большей точности, но это повлияет на производительность.

## Ожидаемый эффект

После исправления пункта 1 (количество точек интегрирования) результаты Frontend и Backend должны совпадать с точностью до погрешности вычислений с плавающей точкой (~0.0001% для простых случаев).

Различия в точности (f32 vs f64) могут давать расхождения в последних значащих цифрах, но для практических задач это обычно несущественно.
