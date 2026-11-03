// Estado inicial
const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
let currentDayIndex = 0; // 0 = Lunes

// Cargar datos desde localStorage o usar iniciales
let activities = JSON.parse(localStorage.getItem('myScheduleActivities')) || [
  { id: 1, dia: 'Lunes', actividad: 'Clases', horas: 3, minutos: 50, distribucion: 'En la mañana y tarde', detalles: 'Ir a la universidad', fija: false }
];

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  renderDayView();
  renderWeekView();
});

// Guardar en LocalStorage
function saveToStorage() {
  localStorage.setItem('myScheduleActivities', JSON.stringify(activities));
}

// Cambiar Vistas
function switchView(view) {
  const dayView = document.getElementById('dayView');
  const weekView = document.getElementById('weekView');
  const btnDay = document.getElementById('btnViewDay');
  const btnWeek = document.getElementById('btnViewWeek');

  if (view === 'day') {
    dayView.classList.add('active');
    weekView.classList.remove('active');
    btnDay.classList.add('active');
    btnWeek.classList.remove('active');
  } else {
    dayView.classList.remove('active');
    weekView.classList.add('active');
    btnDay.classList.remove('active');
    btnWeek.classList.add('active');
  }
}

// Cambiar Día en Vista Diario
function changeDay(step) {
  currentDayIndex = (currentDayIndex + step + daysOfWeek.length) % daysOfWeek.length;
  renderDayView();
}

// Renderizar Vista Día
function renderDayView() {
  const currentDay = daysOfWeek[currentDayIndex];
  document.getElementById('currentDayTitle').textContent = `Día: ${currentDay}`;

  const activitiesList = document.getElementById('activitiesList');
  const dayActivities = activities.filter(a => a.dia === currentDay);

  activitiesList.innerHTML = '';

  if (dayActivities.length === 0) {
    activitiesList.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay actividades para este día</td></tr>`;
    return;
  }

  dayActivities.forEach((act) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${act.actividad}</strong> ${act.fija ? '<span style="color:#ffd700; font-size:0.75rem;">(Fija)</span>' : ''}</td>
      <td>${act.horas}h ${act.minutos}m</td>
      <td>${act.distribucion || '-'}</td>
      <td>${act.detalles || '-'}</td>
      <td><button class="btn btn-delete" onclick="deleteActivity(${act.id})">Borrar</button></td>
    `;
    activitiesList.appendChild(tr);
  });
}

// Renderizar Vista Semanal
function renderWeekView() {
  const weekGrid = document.getElementById('weekGrid');
  weekGrid.innerHTML = '';

  daysOfWeek.forEach((day, index) => {
    const dayCol = document.createElement('div');
    dayCol.className = `week-day-column ${index === currentDayIndex ? 'active-day' : ''}`;

    const dayActivities = activities.filter(a => a.dia === day);

    let itemsHtml = '';
    if (dayActivities.length === 0) {
      itemsHtml = '<p style="color:#999; font-size:0.8rem;">Sin actividades</p>';
    } else {
      dayActivities.forEach(act => {
        itemsHtml += `
          <div class="week-item ${act.fija ? 'fixed-item' : ''}">
            <div class="title">${act.actividad}</div>
            <div class="time">${act.horas}h ${act.minutos}m - ${act.distribucion || ''}</div>
          </div>
        `;
      });
    }

    dayCol.innerHTML = `
      <h3>${day}</h3>
      ${itemsHtml}
    `;
    weekGrid.appendChild(dayCol);
  });
}

// Modal Control
function openModal() {
  document.getElementById('formDia').value = daysOfWeek[currentDayIndex];
  document.getElementById('activityModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('activityModal').style.display = 'none';
  resetForm();
}

function resetForm() {
  document.getElementById('activityForm').reset();
  document.getElementById('formDia').value = daysOfWeek[currentDayIndex];
}

// Guardar Actividad (Acciones de Botones del Modal)
function saveActivity(isFixedDaily) {
  const dia = document.getElementById('formDia').value;
  const actividad = document.getElementById('formActividad').value.trim();
  const horas = parseInt(document.getElementById('formHoras').value) || 0;
  const minutos = parseInt(document.getElementById('formMinutos').value) || 0;
  const distribucion = document.getElementById('formDistribucion').value.trim();
  const detalles = document.getElementById('formDetalles').value.trim();

  if (!actividad) {
    alert('Por favor, ingresa el nombre de la actividad.');
    return;
  }

  if (isFixedDaily) {
    // Si se guarda como "actividad diaria fija", se replica en todos los días de la semana
    daysOfWeek.forEach(dayName => {
      activities.push({
        id: Date.now() + Math.random(),
        dia: dayName,
        actividad,
        horas,
        minutos,
        distribucion,
        detalles,
        fija: true
      });
    });
  } else {
    // Actividad normal para un solo día
    activities.push({
      id: Date.now(),
      dia,
      actividad,
      horas,
      minutos,
      distribucion,
      detalles,
      fija: false
    });
  }

  saveToStorage();
  renderDayView();
  renderWeekView();
  closeModal();
}

// Borrar Actividad Individual
function deleteActivity(id) {
  activities = activities.filter(a => a.id !== id);
  saveToStorage();
  renderDayView();
  renderWeekView();
}