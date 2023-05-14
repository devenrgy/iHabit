'use strict'

const page = {
  navMenu: document.querySelector('.nav__list'),
  header: {
    title: document.querySelector('.header__title'),
    percent: document.querySelector('.progress__top-percent'),
    progress: document.querySelector('.progress__bar-loader')
  },
  body: {
    todosList: document.querySelector('.todos__list')
  },
  popup: {
    cover: document.querySelector('.cover')
  }
}
const HABITS_KEY = 'HABITS_KEY'

let habits = []

/* Utils */
function loadData() {
  const habitsStorage = JSON.parse(localStorage.getItem(HABITS_KEY))

  if (Array.isArray(habitsStorage)) {
    habits = habitsStorage
  }
}

function saveData() {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

/* Render */

function rerenderMenu(activeHabit) {
  for (const habit of habits) {
    const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`)

    if (!existed) {
      const li = document.createElement('li')

      li.classList.add('nav__item')

      const button = document.createElement('button')

      button.setAttribute('menu-habit-id', habit.id)

      button.classList.add('nav__item-btn')

      button.innerHTML = `<img class="nav__item-img" src="dist/svg/${habit.icon}.svg" alt="${habit.name}" width="40"
                                           height="40">`

      button.addEventListener('click', () => rerender(habit.id))

      if (activeHabit.id === habit.id) {
        button.classList.add('nav__item-btn--active')
      }

      li.appendChild(button)
      page.navMenu.appendChild(li)

      continue
    }

    if (activeHabit.id === habit.id) {
      existed.classList.add('nav__item-btn--active')
    } else {
      existed.classList.remove('nav__item-btn--active')
    }
  }
}

function rerenderHead(activeHabit) {

  page.header.title.textContent = activeHabit.name

  const percent = activeHabit.days.length / activeHabit.target > 1 ? 100 : activeHabit.days.length / activeHabit.target * 100

  page.header.percent.textContent = percent.toFixed(0) + '%'
  page.header.progress.setAttribute('style', `width:${percent}%`)
}

function rerenderBody(activeHabit) {
  page.body.todosList.innerHTML = ''
  for (const index in activeHabit.days) {
    const li = document.createElement('li')
    li.classList.add('todos__item')
    li.innerHTML += `<div class="todos__item-day">
          <p>Day ${+index + 1}</p>
        </div>
        <div class="todos__item-desc">
          <p>${activeHabit.days[index].comment}</p>
          <button class="todos__item-rm" data-todoid="${index}">
            <img src="dist/svg/trash.svg" alt="trash" width="20" height="20">
          </button>
        </div>`
    page.body.todosList.appendChild(li)
  }

  page.body.todosList.innerHTML += `<li class="todos__item">
        <form class="todos__item-form" action="">
        <div class="todos__item-day">
          <p>Day ${activeHabit.days.length + 1}</p>
        </div>
        <div class="todos__item-desc">
          <label>
            <input class="todos__item-input" type="text" name="comment" placeholder="Some todo...">
          </label>
          <button class="todos__item-add" type="submit">
            Add
          </button>
        </div>
        </form>
      </li>`
}


function addDays(evt, activeHabitID) {
  evt.preventDefault()

  const form = evt.target
  const data = new FormData(form)
  const comment = data.get('comment')
  form['comment'].classList.remove('error')
  if (!comment) {
    form['comment'].classList.add('error')
  } else {
    habits = habits.map(habit => habit.id === activeHabitID ? {...habit, days: habit.days.concat([{comment}])} : habit)
    rerender(activeHabitID)
    saveData()
  }
}

function deleteDays(evt, activeHabitID) {
  evt.preventDefault()

  const removeButton = evt.target.closest('.todos__item-rm')
  if (removeButton) {
    habits = habits.map(habit => {
      if (habit.id === activeHabitID) {
        return {...habit, days: habit.days.filter((_, i) => i !== +removeButton.dataset.todoid)}
      }
      return habit
    })
    rerender(activeHabitID)
    saveData()
  }
}

function togglePopup(evt) {
  evt.preventDefault()

  const cover = page.popup.cover

  if (!cover.classList.contains('cover--hidden')) {
    document.querySelector('.popup').classList.add('slide-out-elliptic-left-fwd')
    setTimeout(() => {
      document.querySelector('.popup').classList.remove('slide-out-elliptic-left-fwd')
      cover.classList.add('cover--hidden')
    }, 700)
  } else {
    document.querySelector('.popup').classList.add('slide-in-fwd-bl')
    cover.classList.remove('cover--hidden')
    setTimeout(() => {
      document.querySelector('.popup').classList.remove('slide-in-fwd-bl')
    }, 450)
  }
}

function createHabitItem(evt) {
  evt.preventDefault()

  const form = evt.target
  const data = new FormData(form)

  form['Title'].classList.remove('error')
  form['Target'].classList.remove('error')

  let counter = 0

  for (const [key, value] of data.entries()) {
    if (!value) {
      form[key].classList.add('error')
      counter++
    }
  }

  if (!!counter) {
    return false
  }

  habits = [...habits, {
    id: habits.length + 1,
    icon: data.get('icon'),
    name: data.get('Title'),
    target: data.get('Target'),
    days: []
  }]

  rerender(habits.length)
  saveData()
  form.reset()

  document.querySelector('.progress').removeAttribute('style')
  document.querySelector('.nav__list').removeAttribute('style')

  return true
}

function rerender(activeHabitID) {
  const activeHabit = habits.find(habit => habit.id === activeHabitID)
  if (!activeHabit) {
    return
  }
  rerenderMenu(activeHabit)
  rerenderHead(activeHabit)
  rerenderBody(activeHabit)

  document.location.replace(document.location.pathname + '#' + activeHabitID)
  document.querySelector('.todos__item-form').addEventListener('submit', (evt) => addDays(evt, activeHabitID))
  document.querySelectorAll('.todos__item-rm').forEach(el => el.addEventListener('click', (evt) => deleteDays(evt, activeHabitID)))
}

document.querySelector('.nav__add').addEventListener('click', (evt) => togglePopup(evt))
document.querySelector('.popup__close').addEventListener('click', (evt) => togglePopup(evt))
document.querySelector('.popup').addEventListener('submit', (evt) => {
  createHabitItem(evt) && togglePopup(evt)
})

/* Init */
;(() => {
  loadData()
  const currentID = +document.location.hash.replace('#', '')
  const urlHabit = habits.find(habit => habit.id === currentID)

  if (habits.length === 0) {
    page.header.title.textContent = 'Add your first habit'
    document.querySelector('.progress').style.display = 'none'
    document.querySelector('.nav__list').style.display = 'none'
    return
  }

  if (urlHabit) {
    rerender(urlHabit.id)
  } else {
    rerender(habits[0].id)
  }
})()