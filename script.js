document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        loadTasks();
        setupTaskInputs();
    } else if (currentPage === 'perfil.html') {
        loadProfileForEdit();
    }
});

// ------------------ Inputs de tarefa ------------------
function setupTaskInputs() {
    const taskNameInput = document.getElementById('taskName');
    const taskHourInput = document.getElementById('taskHour');

    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

    if (taskNameInput) {
        taskNameInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); addTask(); }
        });
    }

    if (taskHourInput) {
        taskHourInput.addEventListener('keydown', function (e) {
            if (controlKeys.includes(e.key)) return;
            if (e.key === 'Enter') { e.preventDefault(); addTask(); return; }
            if (!/^[0-9]$/.test(e.key)) e.preventDefault();
            const digits = (taskHourInput.value || '').replace(/\D/g, '').slice(0, 4);
            if (digits.length >= 4) e.preventDefault();
        });

        taskHourInput.addEventListener('input', function () {
            let digits = (taskHourInput.value || '').replace(/\D/g, '').slice(0, 4);
            if (digits.length > 2) taskHourInput.value = digits.slice(0, 2) + ':' + digits.slice(2);
            else taskHourInput.value = digits;

            if (digits.length === 4) {
                const h = parseInt(digits.slice(0, 2), 10);
                const m = parseInt(digits.slice(2), 10);
                if (h > 23 || m > 59) { alert('Hora inválida'); taskHourInput.value = ''; }
            }
        });

        taskHourInput.addEventListener('paste', function (e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
            const digits = paste.replace(/\D/g, '').slice(0, 4);
            if (digits.length > 2) taskHourInput.value = digits.slice(0, 2) + ':' + digits.slice(2);
            else taskHourInput.value = digits;
        });

        taskHourInput.setAttribute('maxlength', '5');
    }
}

// ------------------ Tarefas ------------------
function addTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const taskHour = document.getElementById('taskHour').value.trim();
    if (!taskName || !taskHour) return;

    const timeParts = taskHour.split(':');
    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) { alert('Hora inválida'); return; }

    const taskHourFormatted = `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ name: taskName, time: taskHourFormatted });
    localStorage.setItem('tasks', JSON.stringify(tasks));

    loadTasks();
    sendTasksToESP32();

    document.getElementById('taskName').value = '';
    document.getElementById('taskHour').value = '';
}

function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    sendTasksToESP32();
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.sort((a,b) => a.time.localeCompare(b.time));

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task,index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<div><p>${task.name}</p><small>${task.time}</small></div>
                          <div><button onclick="deleteTask(${index})">X</button></div>`;
        taskList.appendChild(card);
    });
}

// ------------------ Envio para ESP32 ------------------
function sendTasksToESP32() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length === 0) return;

    const ESP32_IP = localStorage.getItem('deviceIP') || '192.168.1.7';
    const ESP32_URL = `http://${ESP32_IP}/tasks`;

    fetch(ESP32_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
    })
    .then(res => res.text())
    .then(data => console.log("ESP32 respondeu:", data))
    .catch(err => console.error("Erro ao enviar pro ESP32:", err));
}

// ------------------ Perfil e Conexão ------------------
function saveProfile() {
    const parentName = document.getElementById('parentName').value;
    const childName = document.getElementById('childName').value;
    localStorage.setItem('profile', JSON.stringify({ parentName, childName }));
    alert('Perfil salvo!');
    loadProfileForEdit();
}

function loadProfileForEdit() {
    const profile = JSON.parse(localStorage.getItem('profile')) || {};
    if (profile.parentName) document.getElementById('parentName').value = profile.parentName;
    if (profile.childName) document.getElementById('childName').value = profile.childName;
}

function connectToDevice() {
    const ipInput = document.getElementById('deviceIP').value.trim();
    if (!ipInput) { alert('Insira um IP!'); return; }
    localStorage.setItem('deviceIP', ipInput);
    alert('IP salvo! Dispositivo pronto para receber tarefas.');
}
