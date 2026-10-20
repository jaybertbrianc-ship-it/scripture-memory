import './style.css'
import '@fontsource/fraunces/400.css'
import '@fontsource/fraunces/600.css'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/600.css'
import confetti from 'canvas-confetti'
import { starterVerses } from './verses.js'

const app = document.querySelector('#app')

let verses = JSON.parse(localStorage.getItem('verses'))
if (!verses) {
  verses = starterVerses.map(v => ({ ...v }))
  localStorage.setItem('verses', JSON.stringify(verses))
}

function save() {
  localStorage.setItem('verses', JSON.stringify(verses))
}

function clean(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function distance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1)
      }
    }
  }
  return dp[a.length][b.length]
}

function randomIndex(except) {
  if (verses.length < 2) return 0
  let i
  do {
    i = Math.floor(Math.random() * verses.length)
  } while (i === except)
  return i
}

function fireworks() {
  const end = Date.now() + 1500
  const colors = ['#ffe08a', '#f0b23a', '#ffb347', '#ffffff']
  ;(function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors })
    confetti({ particleCount: 5, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}

function lightBurst() {
  for (let i = 0; i < 14; i++) {
    const ember = document.createElement('div')
    ember.className = 'ember'
    ember.style.left = 10 + Math.random() * 80 + '%'
    ember.style.animationDelay = Math.random() * 0.4 + 's'
    ember.style.setProperty('--drift', Math.random() * 80 - 40 + 'px')
    document.body.appendChild(ember)
    setTimeout(() => ember.remove(), 2400)
  }
}
function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

function markPractice() {
  const data = JSON.parse(localStorage.getItem('streak')) || { last: '', count: 0 }
  const now = new Date()
  const t = dateKey(now)
  if (data.last === t) return
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  data.count = data.last === dateKey(y) ? data.count + 1 : 1
  data.last = t
  localStorage.setItem('streak', JSON.stringify(data))
}

function streakLine() {
  const data = JSON.parse(localStorage.getItem('streak')) || { last: '', count: 0 }
  const now = new Date()
  const y = new Date(now)
  y.setDate(y.getDate() - 1)
  const doneToday = data.last === dateKey(now)
  const alive = doneToday || data.last === dateKey(y)
  const count = alive ? data.count : 0
  if (count === 0) return '<div class="streak">Practice today to start your streak</div>'
  return `<div class="streak"><span class="flame-dot"></span>${count} ${count === 1 ? 'day' : 'days'} in a row${doneToday ? '' : '. Practice today to keep it going'}</div>`
}
function win(v) {
  confetti({ particleCount: 150, spread: 90, origin: { y: 0.7 } })
  lightBurst()
  v.got = (v.got || 0) + 1
    markPractice()
  if (v.got === 5) fireworks()
  save()
}

function lamp(got) {
  const n = Math.min(got || 0, 5)
  const scale = 0.45 + n * 0.23
  const flame = n === 0 ? '' : `
    <g transform="translate(58 30) scale(${scale}) translate(-58 -30)">
      <g class="flame-g ${n === 5 ? 'blaze' : ''}" style="filter: drop-shadow(0 0 ${2 + n * 2}px rgba(255, 170, 60, 0.95))">
        <path d="M58 14 Q67 24 58 30 Q49 24 58 14 Z" fill="#ffb13b" />
        <path d="M58 21 Q62 26 58 30 Q54 26 58 21 Z" fill="#fff3c4" />
      </g>
    </g>`
  return `
    <svg class="lamp" viewBox="0 0 80 64" aria-hidden="true">
      <path class="lamp-handle" d="M10 38 Q1 38 3 46 Q5 51 12 48" />
      <path class="lamp-body" d="M10 36 Q10 52 30 52 Q46 52 48 36 Z" />
      <path class="lamp-body" d="M46 36 L58 30 L55 37 Z" />
      <rect class="lamp-body" x="24" y="52" width="12" height="4" rx="1" />
      ${flame}
    </svg>`
}
function todaysIndex() {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round(midnight.getTime() / 86400000) % verses.length
}

function verseOfDay() {
  if (verses.length === 0) return ''
  const v = verses[todaysIndex()]
  return `
    <div class="votd">
      <div class="votd-label">Verse for today</div>
      <div class="votd-text">${v.text}</div>
      <div class="votd-ref">${v.reference}</div>
      <button id="votd-practice" class="secondary">Practice this verse</button>
    </div>`
}
function lampShelf() {
  const lit = verses.filter(v => (v.got || 0) > 0)
  if (lit.length === 0) {
    return `
      <div class="shelf">
        <div class="shelf-lamps"><div class="shelf-lamp">${lamp(0)}</div></div>
        <div class="progress">Practice a verse to light your first lamp</div>
      </div>`
  }
  const shown = lit.sort((a, b) => b.got - a.got).slice(0, 6)
  return `
    <div class="shelf">
      <div class="shelf-lamps">
        ${shown.map(v => `<div class="shelf-lamp">${lamp(v.got)}<span>${v.reference}</span></div>`).join('')}
      </div>
      <div class="progress">${lit.length} of ${verses.length} verses lit</div>
    </div>`
}

function renderQuiz(index) {
  const v = verses[index]
  app.innerHTML = `
    <h1>Quiz</h1>
    <div class="quiz-ref">${v.reference}</div>
    <textarea id="answer" placeholder="Type the verse from memory"></textarea>
    <button id="check">Check</button>
    <div id="result"></div>
    <button id="next" class="secondary">Next verse</button>
    <button id="back" class="secondary">Back</button>
  `

  document.querySelector('#check').onclick = () => {
    const typed = clean(document.querySelector('#answer').value)
    const real = clean(v.text)
    const allowed = Math.max(2, Math.floor(real.length * 0.08))
    const result = document.querySelector('#result')
    if (distance(typed, real) <= allowed) {
      win(v)
      result.textContent = typed === real
        ? 'Correct! 🎉'
        : 'Correct! 🎉 Small typo. The verse is: ' + v.text
      document.querySelector('#check').disabled = true
    } else {
      result.textContent = 'Not quite. The verse is: ' + v.text
      const box = document.querySelector('#answer')
      box.classList.add('shake')
      setTimeout(() => box.classList.remove('shake'), 500)
    }
  }

  document.querySelector('#next').onclick = () => renderQuiz(randomIndex(index))
  document.querySelector('#back').onclick = () => render()
}

function renderBlank(index) {
  const v = verses[index]
  const words = v.text.split(/\s+/)
  const core = w => w.replace(/^\W+|\W+$/g, '')
  const lead = w => (w.match(/^\W+/) || [''])[0]
  const tail = w => (w.match(/\W+$/) || [''])[0]

  let pool = words.map((w, i) => ({ w, i })).filter(x => clean(x.w).length >= 3)
  if (pool.length === 0) pool = words.map((w, i) => ({ w, i }))
  const count = Math.max(1, Math.round(pool.length * 0.3))
  const hidden = new Set(
    pool.sort(() => Math.random() - 0.5).slice(0, count).map(x => x.i)
  )

  const html = words.map((w, i) =>
    hidden.has(i)
      ? `${lead(w)}<input class="blank-input" data-i="${i}" size="${Math.max(4, core(w).length)}" autocomplete="off" autocapitalize="off" spellcheck="false" />${tail(w)}`
      : w
  ).join(' ')

  app.innerHTML = `
    <h1>Fill in the blanks</h1>
    <div class="quiz-ref">${v.reference}</div>
    <div class="verse-blank">${html}</div>
    <button id="check">Check</button>
    <div id="result"></div>
    <button id="next" class="secondary">Next verse</button>
    <button id="back" class="secondary">Back</button>
  `

  document.querySelector('#check').onclick = () => {
    const inputs = [...document.querySelectorAll('.blank-input')]
    let allRight = true
    inputs.forEach(input => {
      const answer = clean(core(words[Number(input.dataset.i)]))
      const typed = clean(input.value)
      const ok = distance(typed, answer) <= (answer.length >= 6 ? 1 : 0)
      input.classList.toggle('right', ok)
      input.classList.toggle('wrong', !ok)
      if (!ok) allRight = false
    })

    const result = document.querySelector('#result')
    if (allRight) {
      win(v)
      result.textContent = 'Correct! 🎉'
      document.querySelector('#check').disabled = true
    } else {
      result.textContent = 'Some words are off. Fix the red ones and check again.'
    }
  }

  document.querySelector('#next').onclick = () => renderBlank(randomIndex(index))
  document.querySelector('#back').onclick = () => render()
}

function renderChoice(index) {
  const v = verses[index]
  const others = verses
    .filter((_, i) => i !== index)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  const options = [v, ...others].sort(() => Math.random() - 0.5)

  app.innerHTML = `
    <h1>Which verse is this?</h1>
    <div class="verse-blank">${v.text}</div>
    ${options.map(o => `<button class="choice secondary" data-i="${verses.indexOf(o)}">${o.reference}</button>`).join('')}
    <div id="result"></div>
    <button id="next" class="secondary">Next verse</button>
    <button id="back" class="secondary">Back</button>
  `

  let answered = false
  document.querySelectorAll('.choice').forEach(btn => {
    btn.onclick = () => {
      if (answered) return
      answered = true
      const result = document.querySelector('#result')
      if (Number(btn.dataset.i) === index) {
        btn.classList.add('right')
        win(v)
        result.textContent = 'Correct! 🎉'
      } else {
        btn.classList.add('wrong', 'shake')
        setTimeout(() => btn.classList.remove('shake'), 500)
        document.querySelector(`.choice[data-i="${index}"]`).classList.add('right')
        result.textContent = 'Not quite. This is ' + v.reference
      }
    }
  })

  document.querySelector('#next').onclick = () => renderChoice(randomIndex(index))
  document.querySelector('#back').onclick = () => render()
}

function renderPuzzle(index) {
  const v = verses[index]
  const words = v.text.split(/\s+/)
  const size = Math.ceil(words.length / 6)
  const chunks = []
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '))
  }
  const pieces = chunks
    .map((text, i) => ({ text, i }))
    .sort(() => Math.random() - 0.5)
  let placed = []
  let done = false

  app.innerHTML = `
    <h1>Word puzzle</h1>
    <div class="quiz-ref">${v.reference}</div>
    <div id="answer-row" class="piece-row"></div>
    <div id="bank" class="piece-row"></div>
    <div id="result"></div>
    <button id="next" class="secondary">Next verse</button>
    <button id="back" class="secondary">Back</button>
  `

  function check() {
    if (placed.length < pieces.length) return
    const result = document.querySelector('#result')
    if (placed.every((p, k) => p.text === chunks[k])) {
      done = true
      win(v)
      result.textContent = 'Correct! 🎉'
    } else {
      result.textContent = 'Not quite. Tap a phrase above to take it back and try again.'
      const row = document.querySelector('#answer-row')
      row.classList.add('shake')
      setTimeout(() => row.classList.remove('shake'), 500)
    }
  }

  function draw() {
    const answerRow = document.querySelector('#answer-row')
    const bank = document.querySelector('#bank')

    answerRow.innerHTML = placed
      .map((p, k) => `<span class="piece placed" data-k="${k}">${p.text}</span>`)
      .join('') || '<span class="hint">Tap the phrases in order</span>'

    bank.innerHTML = pieces
      .filter(p => !placed.includes(p))
      .map(p => `<span class="piece" data-i="${p.i}">${p.text}</span>`)
      .join('')

    answerRow.querySelectorAll('.piece').forEach(el => {
      el.onclick = () => {
        if (done) return
        placed.splice(Number(el.dataset.k), 1)
        document.querySelector('#result').textContent = ''
        draw()
      }
    })

    bank.querySelectorAll('.piece').forEach(el => {
      el.onclick = () => {
        if (done) return
        placed.push(pieces.find(p => p.i === Number(el.dataset.i)))
        draw()
        check()
      }
    })
  }

  draw()
  document.querySelector('#next').onclick = () => renderPuzzle(randomIndex(index))
  document.querySelector('#back').onclick = () => render()
}

function renderInitials(index) {
  const v = verses[index]
  const hint = v.text.split(/\s+/).map(w => {
    const c = w.replace(/^\W+/, '')
    return c ? c[0] + (w.match(/\W+$/) || [''])[0] : w
  }).join(' ')

  app.innerHTML = `
    <h1>First letters</h1>
    <div class="quiz-ref">${v.reference}</div>
    <div class="initials">${hint}</div>
    <textarea id="answer" placeholder="Type the whole verse from memory"></textarea>
    <button id="check">Check</button>
    <div id="result"></div>
    <button id="next" class="secondary">Next verse</button>
    <button id="back" class="secondary">Back</button>
  `

  document.querySelector('#check').onclick = () => {
    const typed = clean(document.querySelector('#answer').value)
    const real = clean(v.text)
    const allowed = Math.max(2, Math.floor(real.length * 0.08))
    const result = document.querySelector('#result')
    if (distance(typed, real) <= allowed) {
      win(v)
      result.textContent = typed === real
        ? 'Correct! 🎉'
        : 'Correct! 🎉 Small typo. The verse is: ' + v.text
      document.querySelector('#check').disabled = true
    } else {
      result.textContent = 'Not quite. The verse is: ' + v.text
      const box = document.querySelector('#answer')
      box.classList.add('shake')
      setTimeout(() => box.classList.remove('shake'), 500)
    }
  }

  document.querySelector('#next').onclick = () => renderInitials(randomIndex(index))
  document.querySelector('#back').onclick = () => render()
}

function renderTimed() {
  let score = 0
  let timeLeft = 60
  let current = -1
  let locked = false
  let over = false

  app.innerHTML = `
    <h1>Beat the clock</h1>
    <div class="timer-row"><span id="time">60</span><span id="score">Score: 0</span></div>
    <div id="game"></div>
    <button id="back" class="secondary">Back</button>
  `

  function ask() {
    if (over) return
    locked = false
    current = randomIndex(current)
    const v = verses[current]
    const others = verses
      .filter((_, i) => i !== current)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const options = [v, ...others].sort(() => Math.random() - 0.5)

    document.querySelector('#game').innerHTML = `
      <div class="verse-blank">${v.text}</div>
      ${options.map(o => `<button class="choice secondary" data-i="${verses.indexOf(o)}">${o.reference}</button>`).join('')}
    `

    document.querySelectorAll('.choice').forEach(btn => {
      btn.onclick = () => {
        if (locked) return
        locked = true
        if (Number(btn.dataset.i) === current) {
          score++
          document.querySelector('#score').textContent = 'Score: ' + score
          btn.classList.add('right')
          setTimeout(ask, 350)
        } else {
          btn.classList.add('wrong', 'shake')
          document.querySelector(`.choice[data-i="${current}"]`).classList.add('right')
          setTimeout(ask, 900)
        }
      }
    })
  }

  function end() {
    over = true
    clearInterval(timer)
        markPractice()
    const best = Number(localStorage.getItem('best') || 0)
    const isBest = score > best
    if (isBest) {
      localStorage.setItem('best', score)
      fireworks()
    }
    document.querySelector('#game').innerHTML = `
      <div class="final">${score}</div>
      <div class="progress">${isBest ? 'New best score! 🎉' : 'Best: ' + best}</div>
      <button id="again">Play again</button>
    `
    document.querySelector('#again').onclick = () => renderTimed()
  }

  const timer = setInterval(() => {
    timeLeft--
    const t = document.querySelector('#time')
    t.textContent = timeLeft
    t.classList.toggle('urgent', timeLeft <= 10)
    if (timeLeft <= 0) end()
  }, 1000)

  document.querySelector('#back').onclick = () => {
    over = true
    clearInterval(timer)
    render()
  }

  ask()
}

function renderLibrary() {
  app.innerHTML = `
    <button id="back" class="secondary back-top">‹ Home</button>
    <h1>Library</h1>
    <input id="search" placeholder="Search by word or reference" autocomplete="off" />
    <details class="add-box">
      <summary>Add a verse</summary>
      <input id="reference" placeholder="Reference (e.g. John 3:16)" />
      <textarea id="text" placeholder="Type the verse here"></textarea>
      <button id="add">Add verse</button>
    </details>
    <div id="add-message"></div>
    <div class="count" id="count"></div>
    <div class="cards" id="cards"></div>
  `

  function drawCards() {
    if (!document.querySelector('#cards')) return
    const q = clean(document.querySelector('#search').value)
    const list = verses
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => clean(v.reference + ' ' + v.text).includes(q))

    document.querySelector('#count').textContent = q
      ? `${list.length} of ${verses.length} verses`
      : `${verses.length} verses`

    const box = document.querySelector('#cards')
    box.innerHTML = list.map(({ v, i }) => `
      <div class="card">
        <div class="card-inner">
          <div class="card-front ${(v.got || 0) >= 5 ? 'mastered' : ''}">${v.reference}
            <span class="delete" data-index="${i}">✕</span>
            <div class="card-lamp">${lamp(v.got)}</div>
          </div>
          <div class="card-back">
            <div>${v.text}</div>
            <button class="got-it" data-index="${i}">Got it!</button>
          </div>
        </div>
      </div>
    `).join('') || '<div class="progress">No verses match your search.</div>'

    box.querySelectorAll('.delete').forEach(btn => {
      btn.onclick = e => {
        e.stopPropagation()
        if (!confirm('Delete this verse?')) return
        verses.splice(Number(btn.dataset.index), 1)
        save()
        drawCards()
      }
    })

    box.querySelectorAll('.card').forEach(card => {
      card.onclick = () => card.classList.toggle('flipped')
      card.querySelector('.got-it').onclick = e => {
        e.stopPropagation()
        win(verses[Number(e.target.dataset.index)])
        setTimeout(() => card.classList.remove('flipped'), 1200)
        setTimeout(drawCards, 1900)
      }
    })
  }

  document.querySelector('#add').onclick = () => {
    const reference = document.querySelector('#reference').value.trim()
    const text = document.querySelector('#text').value.trim()
    const message = document.querySelector('#add-message')
    if (!reference || !text) {
      message.textContent = 'Type both a reference and the verse.'
      return
    }
    if (verses.some(v => clean(v.reference) === clean(reference))) {
      message.textContent = reference + ' is already in your library.'
      return
    }
    verses.push({ reference, text })
    save()
    document.querySelector('#reference').value = ''
    document.querySelector('#text').value = ''
    message.textContent = reference + ' was added to your library.'
    drawCards()
  }

  document.querySelector('#search').oninput = drawCards
  document.querySelector('#back').onclick = () => render()
  drawCards()
}

function render() {
  const modes = verses.length > 0
    ? `<div class="modes">
        <button id="quiz" class="secondary">Quiz me</button>
        <button id="blank" class="secondary">Fill blanks</button>
        ${verses.length > 1 ? '<button id="choice" class="secondary">Which verse?</button>' : ''}
        <button id="puzzle" class="secondary">Word puzzle</button>
        <button id="initials" class="secondary">First letters</button>
        ${verses.length > 1 ? '<button id="timed" class="secondary">Beat the clock</button>' : ''}
      </div>`
    : '<div class="progress">Your library is empty. Open the library to add a verse.</div>'

  app.innerHTML = `
    <h1>Scripture Memory</h1>
        <div class="tagline">Your word is a lamp to my feet</div>
            ${streakLine()}
    ${verseOfDay()}
    ${lampShelf()}
    ${modes}
    <button id="library" class="secondary">Library (${verses.length})</button>
  `

  const go = (id, fn) => {
    const b = document.querySelector(id)
    if (b) b.onclick = fn
  }
    go('#votd-practice', () => renderBlank(todaysIndex()))
  go('#quiz', () => renderQuiz(randomIndex(-1)))
  go('#blank', () => renderBlank(randomIndex(-1)))
  go('#choice', () => renderChoice(randomIndex(-1)))
  go('#puzzle', () => renderPuzzle(randomIndex(-1)))
  go('#initials', () => renderInitials(randomIndex(-1)))
  go('#timed', () => renderTimed())
  go('#library', () => renderLibrary())
}

render()


function intro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const el = document.createElement('div')
  el.id = 'intro'
  el.innerHTML = `
    <div class="intro-glow"></div>
    <div class="intro-beams"></div>
    <div class="intro-flame"></div>
    <div class="intro-title">Scripture Memory</div>
    <div class="intro-verse">Your word is a lamp to my feet</div>
  `

  for (let i = 0; i < 28; i++) {
    const mote = document.createElement('div')
    mote.className = 'mote'
    mote.style.left = Math.random() * 100 + '%'
    mote.style.top = 30 + Math.random() * 70 + '%'
    mote.style.animationDelay = 1.5 + Math.random() * 3 + 's'
    mote.style.animationDuration = 4 + Math.random() * 4 + 's'
    mote.style.setProperty('--dx', Math.random() * 60 - 30 + 'px')
    el.appendChild(mote)
  }

  document.body.appendChild(el)

  let closed = false
  const close = () => {
    if (closed) return
    closed = true
    el.classList.add('leaving')
    setTimeout(() => el.remove(), 900)
  }
  el.onclick = close
  setTimeout(close, 5200)
}

intro()


if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
  })
}