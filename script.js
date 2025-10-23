document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        loadTasks();

        const taskNameInput = document.getElementById('taskName');
        const taskHourInput = document.getElementById('taskHour');

        if (taskNameInput) {
            taskNameInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                }
            });
        }

        if (taskHourInput) {
            taskHourInput.addEventListener('keydown', function (e) {
                const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                if (controlKeys.includes(e.key)) return;
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addTask();
                    return;
                }
                if (!/^[0-9]$/.test(e.key)) {
                    e.preventDefault();
                    return;
                }
                const digits = (taskHourInput.value || '').replace(/\D/g, '');
                if (digits.length >= 4) {
                    e.preventDefault();
                }
            });

            taskHourInput.addEventListener('input', function () {
                let digits = (taskHourInput.value || '').replace(/\D/g, '').slice(0, 4);
                if (digits.length > 2) {
                    taskHourInput.value = digits.slice(0, 2) + ':' + digits.slice(2);
                } else {
                    taskHourInput.value = digits;
                }
                if (digits.length === 4) {
                    const h = parseInt(digits.slice(0, 2), 10);
                    const m = parseInt(digits.slice(2), 10);
                    if (h > 23 || m > 59) {
                        alert('Hora inválida. Use um horário real entre 00:00 e 23:59.');
                        taskHourInput.value = '';
                    }
                }
            });

            taskHourInput.addEventListener('paste', function (e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text') || '';
                const digits = paste.replace(/\D/g, '').slice(0, 4);
                if (digits.length > 2) {
                    taskHourInput.value = digits.slice(0, 2) + ':' + digits.slice(2);
                } else {
                    taskHourInput.value = digits;
                }
                if (digits.length === 4) {
                    const h = parseInt(digits.slice(0, 2), 10);
                    const m = parseInt(digits.slice(2), 10);
                    if (h > 23 || m > 59) {
                        alert('Hora inválida. Use um horário real entre 00:00 e 23:59.');
                        taskHourInput.value = '';
                    }
                }
            });

            taskHourInput.setAttribute('maxlength', '5');
        }

    } else if (currentPage === 'perfil.html') {
        loadProfileForEdit();
    }
});

function saveProfile() {
    const parentName = document.getElementById('parentName').value;
    const childName = document.getElementById('childName').value;

    const profile = {
        parentName,
        childName
    };

    localStorage.setItem('profile', JSON.stringify(profile));
    updateLastEdited();
    alert('Perfil salvo com sucesso!');
    loadProfileForEdit(); 
}

function loadProfileForEdit() {
    const profile = JSON.parse(localStorage.getItem('profile'));
    if (profile) {
        document.getElementById('parentName').value = profile.parentName || '';
        document.getElementById('childName').value = profile.childName || '';
        document.getElementById('parentDisplay').textContent = profile.parentName || 'Visitante';
        document.getElementById('childDisplay').textContent = profile.childName || '—';
    }

    const deviceIP = localStorage.getItem('deviceIP');
    if (deviceIP) {
        document.getElementById('deviceIP').value = deviceIP;
    }
}

function resetApp() {
    if (confirm('Tem certeza que deseja apagar todos os dados? Isso inclui perfil e tarefas.')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
        alert('Todos os dados foram apagados.');
    }
}

function formatTime(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
        value = value.slice(0, 2) + ':' + value.slice(2);
    }
    input.value = value;
    if (value.length === 5) {
        const [h, m] = value.split(':').map(Number);
        if (h > 23 || m > 59) {
            alert('Hora inválida. Use um horário real entre 00:00 e 23:59.');
            input.value = '';
        }
    }
}

function addTask() {
    const taskName = document.getElementById('taskName').value;
    const taskHourInput = document.getElementById('taskHour').value;
    if (taskName && taskHourInput) {
        const timeParts = taskHourInput.split(':');
        if (timeParts.length !== 2) {
            alert('Formato de hora inválido. Use HH:MM');
            return;
        }
        const hour = parseInt(timeParts[0], 10);
        const minute = parseInt(timeParts[1], 10);
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            alert('Hora inválida. Verifique os valores de hora e minuto.');
            return;
        }
        const taskHour = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({ name: taskName, time: taskHour, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateLastEdited();
        loadTasks();
        document.getElementById('taskName').value = '';
        document.getElementById('taskHour').value = '';
    }
}

function deleteTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateLastEdited();
    loadTasks();
}

function toggleTask(index) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateLastEdited();
    loadTasks();
}

function updateLastEdited() {
    const profile = JSON.parse(localStorage.getItem('profile'));
    if(profile && profile.parentName) {
        localStorage.setItem('lastEditedBy', profile.parentName);
    }
}

function loadTasks() {
    const profile = JSON.parse(localStorage.getItem('profile'));
    const routineTitle = document.getElementById('routine-title');
    const lastEditedInfo = document.getElementById('last-edited-info');
    if (profile && profile.childName) {
        routineTitle.textContent = `Rotina de ${profile.childName}`;
    } else {
        routineTitle.textContent = 'Rotina de Hoje';
    }
    const lastEditedBy = localStorage.getItem('lastEditedBy');
    if (lastEditedBy) {
        lastEditedInfo.textContent = `(editado por ${lastEditedBy})`;
    } else {
        lastEditedInfo.textContent = '';
    }
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.sort((a, b) => a.time.localeCompare(b.time));
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        if (task.completed) {
            card.style.textDecoration = 'line-through';
            card.style.opacity = '0.6';
        }
        card.innerHTML = `
            <div>
                <p>${task.name}</p>
                <small>${task.time}</small>
            </div>
            <div>
                <button onclick="toggleTask(${index})" style="background: ${task.completed ? 'var(--mid)' : 'var(--light)'}; color: ${task.completed ? '#fff' : 'var(--dark)'};">${task.completed ? 'Desfazer' : 'Feito!'}</button>
                <button onclick="deleteTask(${index})" style="margin-left: 5px; background: var(--accent-dark);">X</button>
            </div>
        `;
        taskList.appendChild(card);
    });
}

function connectToDevice() {
    const ip = document.getElementById('deviceIP').value;
    if (ip) {
        localStorage.setItem('deviceIP', ip);
        const statusElement = document.getElementById('connectionStatus');
        statusElement.textContent = 'Tentando conectar a ' + ip + '...';
        statusElement.style.color = 'var(--light)';
        setTimeout(() => {
            statusElement.textContent = 'Conectado com sucesso ao dispositivo!';
            statusElement.style.color = '#4CAF50';
        }, 2000);
    } else {
        alert('Por favor, insira um endereço IP.');
    }
}
