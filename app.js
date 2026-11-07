// GiftTracker Web App - Single File JavaScript
(function() {
    'use strict';

    // Data Store
    const store = {
        people: [],
        events: [],
        gifts: [],
        
        load() {
            try {
                const data = localStorage.getItem('gifttracker');
                if (data) {
                    const parsed = JSON.parse(data);
                    this.people = parsed.people || [];
                    this.events = parsed.events || [];
                    this.gifts = parsed.gifts || [];
                } else {
                    this.loadDemo();
                }
            } catch(e) {
                this.loadDemo();
            }
        },
        
        save() {
            localStorage.setItem('gifttracker', JSON.stringify({
                people: this.people,
                events: this.events,
                gifts: this.gifts
            }));
        },
        
        loadDemo() {
            this.people = [
                {id: '1', name: 'Мама', birthday: '1975-03-15', relationship: 'Родственник', notes: 'Любит цветы'},
                {id: '2', name: 'Папа', birthday: '1970-07-22', relationship: 'Родственник', notes: 'Увлекается рыбалкой'},
                {id: '3', name: 'Анна', birthday: '1995-11-08', relationship: 'Друг', notes: 'Любит книги'},
                {id: '4', name: 'Дима', birthday: '1992-01-30', relationship: 'Коллега', notes: 'Геймер'}
            ];
            this.events = [
                {id: '1', title: 'День рождения Мамы', date: '2026-03-15', type: 'birthday', budget: 100, personId: '1'},
                {id: '2', title: 'Новый год', date: '2026-12-31', type: 'holiday', budget: 200},
                {id: '3', title: '8 марта', date: '2026-03-08', type: 'holiday', budget: 150}
            ];
            this.gifts = [
                {id: '1', name: 'Букет цветов', price: 50, status: 'planned', eventId: '1', store: 'Цветочный'},
                {id: '2', name: 'Парфюм', price: 80, status: 'bought', eventId: '1', store: 'Летуаль'}
            ];
            this.save();
        },
        
        addPerson(p) {
            p.id = Date.now().toString();
            this.people.push(p);
            this.save();
        },
        
        addEvent(e) {
            e.id = Date.now().toString();
            this.events.push(e);
            this.save();
        },
        
        addGift(g) {
            g.id = Date.now().toString();
            this.gifts.push(g);
            this.save();
        },
        
        getUpcomingBirthdays(days = 30) {
            const now = new Date();
            return this.people.filter(p => p.birthday).map(p => {
                const bday = new Date(p.birthday);
                const next = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
                if (next < now) next.setFullYear(now.getFullYear() + 1);
                const diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
                return {...p, daysUntil: diff};
            }).filter(p => p.daysUntil >= 0 && p.daysUntil <= days).sort((a, b) => a.daysUntil - b.daysUntil);
        },
        
        getUpcomingEvents(days = 30) {
            const now = new Date();
            return this.events.map(e => {
                const d = new Date(e.date);
                const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                return {...e, daysUntil: diff};
            }).filter(e => e.daysUntil >= 0 && e.daysUntil <= days).sort((a, b) => a.daysUntil - b.daysUntil);
        },
        
        getGiftsForEvent(eventId) {
            return this.gifts.filter(g => g.eventId === eventId);
        },
        
        getStats() {
            const totalBudget = this.events.reduce((s, e) => s + (parseFloat(e.budget) || 0), 0);
            const totalSpent = this.gifts.reduce((s, g) => s + (parseFloat(g.price) || 0), 0);
            return {totalBudget, totalSpent, remaining: totalBudget - totalSpent, people: this.people.length, events: this.events.length, gifts: this.gifts.length};
        }
    };

    // UI Helpers
    const icons = {
        birthday: '🎂', anniversary: '❤️', holiday: '⭐', other: '🎁',
        planned: '○', bought: '✓', wrapped: '🎁', given: '✔️'
    };
    
    const colors = {
        birthday: '#FF4D80', anniversary: '#FF3B30', holiday: '#FF9500', other: '#007AFF',
        planned: '#8E8E93', bought: '#007AFF', wrapped: '#FF9500', given: '#34C759'
    };

    let currentTab = 'dashboard';
    let currentView = 'dashboard';

    // Initialize
    window.addEventListener('DOMContentLoaded', () => {
        store.load();
        setTimeout(() => {
            document.getElementById('splash').classList.add('hidden');
            renderDashboard();
        }, 1500);
    });

    // Tab Switching
    window.switchTab = function(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        event.target.closest('.tab').classList.add('active');
        
        switch(tab) {
            case 'dashboard': renderDashboard(); break;
            case 'people': renderPeople(); break;
            case 'events': renderEvents(); break;
            case 'stats': renderStats(); break;
        }
    };

    // Render Functions
    function renderDashboard() {
        const stats = store.getStats();
        const birthdays = store.getUpcomingBirthdays();
        const events = store.getUpcomingEvents();
        
        let html = '<div class="p-20">';
        
        // Welcome
        html += '<div class="mb-20">';
        html += '<div class="font-b" style="font-size:28px;margin-bottom:4px">Привет! 🎉</div>';
        html += '<div class="text-s">Вот что происходит сейчас</div>';
        html += '</div>';
        
        // Birthdays
        if (birthdays.length > 0) {
            html += '<div class="mb-20">';
            html += '<div class="font-sb" style="font-size:20px;margin-bottom:12px">🎂 Ближайшие дни рождения</div>';
            html += '<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px">';
            birthdays.slice(0, 5).forEach(p => {
                html += `<div class="card" style="min-width:160px;margin:0;cursor:pointer" onclick="renderPersonDetail('${p.id}')">`;
                html += '<div class="p-16">';
                html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">';
                html += '<span style="font-size:32px">👤</span>';
                html += `<span class="badge">${p.daysUntil === 0 ? 'Сегодня!' : p.daysUntil + ' дн.'}</span>`;
                html += '</div>';
                html += `<div class="font-sb">${p.name}</div>`;
                html += '</div></div>';
            });
            html += '</div></div>';
        }
        
        // Events
        if (events.length > 0) {
            html += '<div class="mb-20">';
            html += '<div class="font-sb" style="font-size:20px;margin-bottom:12px">🎁 Ближайшие события</div>';
            events.slice(0, 5).forEach(e => {
                html += `<div class="card" style="margin-bottom:8px;cursor:pointer" onclick="renderEventDetail('${e.id}')">`;
                html += '<div class="card-r">';
                html += `<div class="card-i" style="background:${colors[e.type] || colors.other}15;color:${colors[e.type] || colors.other}">${icons[e.type] || icons.other}</div>`;
                html += '<div class="card-c">';
                html += `<div class="card-t">${e.title}</div>`;
                html += `<div class="card-s">${new Date(e.date).toLocaleDateString('ru-RU')} · ${e.daysUntil} дн.</div>`;
                html += '</div>';
                if (e.budget > 0) html += `<div style="color:var(--ios-label2)">${e.budget} $</div>`;
                html += '</div></div>';
            });
            html += '</div>';
        }
        
        // Quick Actions
        html += '<div class="mb-20">';
        html += '<div class="font-sb" style="font-size:20px;margin-bottom:12px">⚡ Быстрые действия</div>';
        html += '<div class="row">';
        html += '<button class="btn btn2" onclick="renderAddPerson()">👤 Добавить</button>';
        html += '<button class="btn btn2" onclick="renderAddEvent()">📅 Событие</button>';
        html += '</div></div>';
        
        // Stats
        html += '<div>';
        html += '<div class="font-sb" style="font-size:20px;margin-bottom:12px">📊 Статистика</div>';
        html += '<div class="row">';
        html += `<div class="card col"><div class="p-16"><div class="text-s" style="font-size:13px">Бюджет</div><div class="font-b" style="font-size:24px;color:var(--ios-blue)">${stats.totalBudget} $</div></div></div>`;
        html += `<div class="card col"><div class="p-16"><div class="text-s" style="font-size:13px">Потрачено</div><div class="font-b" style="font-size:24px;color:var(--ios-green)">${stats.totalSpent} $</div></div></div>`;
        html += '</div></div>';
        
        html += '</div>';
        document.getElementById('content').innerHTML = html;
    }

    window.renderPeople = function() {
        let html = '<div class="content">';
        
        // Search
        html += '<div class="search"><div class="search-i"><span>🔍</span><input type="text" placeholder="Поиск" oninput="filterPeople(this.value)"></div></div>';
        
        if (store.people.length > 0) {
            html += '<div id="people-list">';
            store.people.forEach(p => {
                const age = p.birthday ? new Date().getFullYear() - new Date(p.birthday).getFullYear() : null;
                html += `<div class="card" style="margin-bottom:1px;cursor:pointer" onclick="renderPersonDetail('${p.id}')">`;
                html += '<div class="card-r">';
                html += '<div class="card-i" style="background:#FF4D8015;color:#FF4D80;font-size:24px">👤</div>';
                html += '<div class="card-c">';
                html += `<div class="card-t">${p.name}</div>`;
                if (p.relationship) html += `<div class="card-s">${p.relationship}</div>`;
                html += '</div>';
                if (age) html += `<div class="text-s">${age} лет</div>`;
                html += '<div class="text-s">&rsaquo;</div>';
                html += '</div></div>';
            });
            html += '</div>';
        } else {
            html += '<div class="empty">';
            html += '<div class="empty-i">👤</div>';
            html += '<div class="empty-t">Нет людей</div>';
            html += '<div class="empty-s">Добавьте близких</div>';
            html += '<button class="btn" style="margin-top:16px" onclick="renderAddPerson()">Добавить</button>';
            html += '</div>';
        }
        
        html += '</div>';
        document.getElementById('content').innerHTML = html;
    };

    window.filterPeople = function(query) {
        const items = document.querySelectorAll('#people-list > div');
        items.forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(query.toLowerCase()) ? '' : 'none';
        });
    };

    window.renderPersonDetail = function(id) {
        const p = store.people.find(x => x.id === id);
        if (!p) return renderPeople();
        
        const age = p.birthday ? new Date().getFullYear() - new Date(p.birthday).getFullYear() : null;
        
        let html = '<div class="content">';
        html += '<div style="text-align:center;padding:32px 16px">';
        html += '<div style="font-size:80px;margin-bottom:12px">👤</div>';
        html += `<div class="font-b" style="font-size:24px;margin-bottom:4px">${p.name}</div>`;
        if (p.relationship) html += `<div class="text-s">${p.relationship}</div>`;
        html += '</div>';
        
        html += '<div class="card" style="margin-bottom:16px">';
        if (p.birthday) {
            html += '<div class="card-r"><span style="font-size:20px">🎂</span><div class="card-c"><div class="card-t">День рождения</div><div class="card-s">' + new Date(p.birthday).toLocaleDateString('ru-RU') + '</div></div></div>';
        }
        if (age) {
            html += `<div class="card-r"><span style="font-size:20px">📱</span><div class="card-c"><div class="card-t">Возраст</div><div class="card-s">${age} лет</div></div></div>`;
        }
        if (p.notes) {
            html += `<div class="card-r"><span style="font-size:20px">📝</span><div class="card-c"><div class="card-t">Заметки</div><div class="card-s">${p.notes}</div></div></div>`;
        }
        html += '</div>';
        
        html += '<button class="btn" onclick="renderAddEvent()">Добавить событие</button>';
        html += '</div>';
        document.getElementById('content').innerHTML = html;
    };

    window.renderEvents = function() {
        let html = '<div class="content">';
        
        // Filters
        html += '<div style="display:flex;gap:8px;padding:12px 16px;overflow-x:auto">';
        html += '<span class="badge">Все</span>';
        html += '<span class="badge" style="background:var(--ios-fill);color:var(--ios-label2)">Ближайшие</span>';
        html += '<span class="badge" style="background:var(--ios-fill);color:var(--ios-label2)">Дни рождения</span>';
        html += '</div>';
        
        if (store.events.length > 0) {
            store.events.forEach(e => {
                const d = new Date(e.date);
                const now = new Date();
                const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                html += `<div class="card" style="margin-bottom:1px;cursor:pointer" onclick="renderEventDetail('${e.id}')">`;
                html += '<div class="card-r">';
                html += `<div class="card-i" style="background:${colors[e.type]}15;color:${colors[e.type]}">${icons[e.type]}</div>`;
                html += '<div class="card-c">';
                html += `<div class="card-t">${e.title}</div>`;
                html += `<div class="card-s">${d.toLocaleDateString('ru-RU')} ${diff >= 0 ? '· ' + diff + ' дн.' : ''}</div>`;
                html += '</div>';
                if (e.budget > 0) html += `<div class="text-s">${e.budget} $</div>`;
                html += '<div class="text-s">&rsaquo;</div>';
                html += '</div></div>';
            });
        } else {
            html += '<div class="empty">';
            html += '<div class="empty-i">📅</div>';
            html += '<div class="empty-t">Нет событий</div>';
            html += '<button class="btn" style="margin-top:16px" onclick="renderAddEvent()">Добавить</button>';
            html += '</div>';
        }
        
        html += '</div>';
        document.getElementById('content').innerHTML = html;
    };

    window.renderEventDetail = function(id) {
        const e = store.events.find(x => x.id === id);
        if (!e) return renderEvents();
        
        const gifts = store.getGiftsForEvent(id);
        const spent = gifts.reduce((s, g) => s + (parseFloat(g.price) || 0), 0);
        const remaining = (parseFloat(e.budget) || 0) - spent;
        
        let html = '<div class="content">';
        html += '<div style="text-align:center;padding:32px 16px">';
        html += `<div style="font-size:60px;margin-bottom:12px">${icons[e.type]}</div>`;
        html += `<div class="font-b" style="font-size:24px;margin-bottom:4px">${e.title}</div>`;
        html += `<div class="text-s">${new Date(e.date).toLocaleDateString('ru-RU')}</div>`;
        html += '</div>';
        
        if (e.budget > 0) {
            html += '<div class="card" style="margin-bottom:16px">';
            html += '<div class="p-16">';
            html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
            html += `<div><div class="text-s" style="font-size:13px">Бюджет</div><div class="font-b" style="font-size:20px">${e.budget} $</div></div>`;
            html += `<div style="text-align:right"><div class="text-s" style="font-size:13px">Потрачено</div><div class="font-b" style="font-size:20px;color:${remaining >= 0 ? 'var(--ios-green)' : 'var(--ios-red)'}">${spent} $</div></div>`;
            html += '</div>';
            html += `<div class="progress"><div class="progress-f" style="width:${Math.min((spent/e.budget)*100,100)}%;background:${remaining >= 0 ? 'var(--ios-green)' : 'var(--ios-red)'}"></div></div>`;
            html += '</div></div>';
        }
        
        html += '<div style="margin-bottom:16px">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 16px;margin-bottom:12px">';
        html += '<div class="font-sb" style="font-size:20px">🎁 Подарки</div>';
        html += `<button style="background:none;border:none;color:var(--ios-blue);font-size:15px;cursor:pointer" onclick="showAddGift('${e.id}')">+ Добавить</button>`;
        html += '</div>';
        
        if (gifts.length > 0) {
            gifts.forEach(g => {
                html += '<div class="card" style="margin-bottom:1px">';
                html += '<div class="card-r">';
                html += `<div class="card-i" style="background:${colors[g.status]}15;color:${colors[g.status]}">${icons[g.status]}</div>`;
                html += '<div class="card-c">';
                html += `<div class="card-t">${g.name}</div>`;
                html += `<div class="card-s">${g.store || ''} · ${g.status}</div>`;
                html += '</div>';
                if (g.price > 0) html += `<div class="text-s">${g.price} $</div>`;
                html += '</div></div>';
            });
        } else {
            html += '<div class="empty" style="padding:32px">';
            html += '<div class="empty-i" style="font-size:48px">🎁</div>';
            html += '<div class="empty-s">Нет подарков</div>';
            html += '</div>';
        }
        
        html += '</div></div>';
        document.getElementById('content').innerHTML = html;
    };

    window.renderStats = function() {
        const stats = store.getStats();
        
        let html = '<div class="content"><div class="p-20">';
        html += '<div class="font-b" style="font-size:28px;margin-bottom:20px">Статистика</div>';
        
        html += '<div class="row mb-20">';
        html += `<div class="card col"><div class="p-16"><div class="text-s" style="font-size:13px">Бюджет</div><div class="font-b" style="font-size:24px;color:var(--ios-blue)">${stats.totalBudget} $</div></div></div>`;
        html += `<div class="card col"><div class="p-16"><div class="text-s" style="font-size:13px">Потрачено</div><div class="font-b" style="font-size:24px;color:var(--ios-green)">${stats.totalSpent} $</div></div></div>`;
        html += '</div>';
        
        html += '<div class="card mb-20"><div class="p-16">';
        html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
        html += `<div><div class="text-s" style="font-size:13px">Общий бюджет</div><div class="font-b" style="font-size:20px">${stats.totalBudget} $</div></div>`;
        html += `<div style="text-align:right"><div class="text-s" style="font-size:13px">Осталось</div><div class="font-b" style="font-size:20px;color:${stats.remaining >= 0 ? 'var(--ios-green)' : 'var(--ios-red)'}">${stats.remaining} $</div></div>`;
        html += '</div>';
        html += `<div class="progress"><div class="progress-f" style="width:${stats.totalBudget > 0 ? Math.min((stats.totalSpent/stats.totalBudget)*100,100) : 0}%;background:${stats.remaining >= 0 ? 'var(--ios-green)' : 'var(--ios-red)'}"></div></div>`;
        html += '</div></div>';
        
        html += '<div class="card mb-20">';
        html += `<div class="card-r"><span style="font-size:20px">👥</span><div class="card-c"><div class="card-t">Людей</div></div><div class="text-s">${stats.people}</div></div>`;
        html += `<div class="card-r"><span style="font-size:20px">🎁</span><div class="card-c"><div class="card-t">Событий</div></div><div class="text-s">${stats.events}</div></div>`;
        html += `<div class="card-r"><span style="font-size:20px">🎌</span><div class="card-c"><div class="card-t">Подарков</div></div><div class="text-s">${stats.gifts}</div></div>`;
        html += '</div>';
        
        html += '<div><div class="font-sb" style="font-size:20px;margin-bottom:12px">💡 Советы</div>';
        html += '<div class="card mb-12"><div class="card-r"><span style="font-size:24px">📅</span><div class="card-c"><div class="card-t">Планируйте заранее</div><div class="card-s">Покупайте подарки заранее</div></div></div></div>';
        html += '<div class="card"><div class="card-r"><span style="font-size:24px">💰</span><div class="card-c"><div class="card-t">Следите за бюджетом</div><div class="card-s">Устанавливайте лимит на каждое событие</div></div></div></div>';
        html += '</div>';
        
        html += '</div></div>';
        document.getElementById('content').innerHTML = html;
    };

    window.renderAddPerson = function() {
        let html = '<div class="content"><div class="p-20">';
        html += '<div class="font-b" style="font-size:28px;margin-bottom:20px">Новый человек</div>';
        
        html += '<div class="form">';
        html += '<div class="form-r"><label class="form-l">Имя</label><input class="form-in" id="p-name" placeholder="Введите имя"></div>';
        html += '<div class="form-r"><label class="form-l">День Р</label><input class="form-in" id="p-bday" type="date" style="text-align:right"></div>';
        html += '<div class="form-r"><label class="form-l">Отношения</label><input class="form-in" id="p-rel" placeholder="Друг, родственник"></div>';
        html += '</div>';
        
        html += '<div class="form"><div class="form-r" style="align-items:flex-start"><label class="form-l" style="padding-top:12px">Заметки</label><textarea class="form-in" id="p-notes" rows="3" style="text-align:left;resize:none"></textarea></div></div>';
        
        html += '<button class="btn" style="margin-top:20px" onclick="savePerson()">Сохранить</button>';
        html += '</div></div>';
        document.getElementById('content').innerHTML = html;
    };

    window.savePerson = function() {
        const name = document.getElementById('p-name').value;
        if (!name) { alert('Введите имя'); return; }
        store.addPerson({
            name,
            birthday: document.getElementById('p-bday').value,
            relationship: document.getElementById('p-rel').value,
            notes: document.getElementById('p-notes').value
        });
        renderPeople();
    };

    window.renderAddEvent = function() {
        let html = '<div class="content"><div class="p-20">';
        html += '<div class="font-b" style="font-size:28px;margin-bottom:20px">Новое событие</div>';
        
        html += '<div class="form">';
        html += '<div class="form-r"><label class="form-l">Название</label><input class="form-in" id="e-title" placeholder="День рождения..."></div>';
        html += '<div class="form-r"><label class="form-l">Дата</label><input class="form-in" id="e-date" type="date" style="text-align:right"></div>';
        html += '<div class="form-r"><label class="form-l">Тип</label><select class="form-in" id="e-type" style="text-align:right;border:none;background:none"><option value="birthday">День рождения</option><option value="anniversary">Годовщина</option><option value="holiday">Праздник</option><option value="other">Другое</option></select></div>';
        html += '<div class="form-r"><label class="form-l">Бюджет ($)</label><input class="form-in" id="e-budget" type="number" placeholder="0" style="text-align:right"></div>';
        html += '</div>';
        
        html += '<button class="btn" style="margin-top:20px" onclick="saveEvent()">Сохранить</button>';
        html += '</div></div>';
        document.getElementById('content').innerHTML = html;
    };

    window.saveEvent = function() {
        const title = document.getElementById('e-title').value;
        const date = document.getElementById('e-date').value;
        if (!title || !date) { alert('Заполните название и дату'); return; }
        store.addEvent({
            title,
            date,
            type: document.getElementById('e-type').value,
            budget: parseFloat(document.getElementById('e-budget').value) || 0
        });
        renderEvents();
    };

    window.showAddGift = function(eventId) {
        const name = prompt('Название подарка:');
        if (!name) return;
        const price = parseFloat(prompt('Цена ($):') || 0);
        store.addGift({name, price, status: 'planned', eventId});
        renderEventDetail(eventId);
    };

})();
