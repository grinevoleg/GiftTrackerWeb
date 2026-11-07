// GiftTracker Web App
(function() {
    'use strict';

    // Data Store
    var store = {
        people: [],
        events: [],
        gifts: [],
        
        load: function() {
            try {
                var data = localStorage.getItem('gifttracker');
                if (data) {
                    var parsed = JSON.parse(data);
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
        
        save: function() {
            localStorage.setItem('gifttracker', JSON.stringify({
                people: this.people,
                events: this.events,
                gifts: this.gifts
            }));
        },
        
        loadDemo: function() {
            this.people = [
                {id: '1', name: '\u041c\u0430\u043c\u0430', birthday: '1975-03-15', relationship: '\u0420\u043e\u0434\u0441\u0442\u0432\u0435\u043d\u043d\u0438\u043a', notes: '\u041b\u044e\u0431\u0438\u0442 \u0446\u0432\u0435\u0442\u044b'},
                {id: '2', name: '\u041f\u0430\u043f\u0430', birthday: '1970-07-22', relationship: '\u0420\u043e\u0434\u0441\u0442\u0432\u0435\u043d\u043d\u0438\u043a', notes: '\u0423\u0432\u043b\u0435\u043a\u0430\u0435\u0442\u0441\u044f \u0440\u044b\u0431\u0430\u043b\u043a\u043e\u0439'},
                {id: '3', name: '\u0410\u043d\u043d\u0430', birthday: '1995-11-08', relationship: '\u0414\u0440\u0443\u0433', notes: '\u041b\u044e\u0431\u0438\u0442 \u043a\u043d\u0438\u0433\u0438'},
                {id: '4', name: '\u0414\u0438\u043c\u0430', birthday: '1992-01-30', relationship: '\u041a\u043e\u043b\u043b\u0435\u0433\u0430', notes: '\u0413\u0435\u0439\u043c\u0435\u0440'}
            ];
            this.events = [
                {id: '1', title: '\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f \u041c\u0430\u043c\u044b', date: '2026-03-15', type: 'birthday', budget: 100, personId: '1'},
                {id: '2', title: '\u041d\u043e\u0432\u044b\u0439 \u0433\u043e\u0434', date: '2026-12-31', type: 'holiday', budget: 200},
                {id: '3', title: '8 \u043c\u0430\u0440\u0442\u0430', date: '2026-03-08', type: 'holiday', budget: 150}
            ];
            this.gifts = [
                {id: '1', name: '\u0411\u0443\u043a\u0435\u0442 \u0446\u0432\u0435\u0442\u043e\u0432', price: 50, status: 'planned', eventId: '1', store: '\u0426\u0432\u0435\u0442\u043e\u0447\u043d\u044b\u0439'},
                {id: '2', name: '\u041f\u0430\u0440\u0444\u044e\u043c', price: 80, status: 'bought', eventId: '1', store: '\u041b\u0435\u0442\u0443\u0430\u043b\u044c'}
            ];
            this.save();
        },
        
        addPerson: function(p) {
            p.id = Date.now().toString();
            this.people.push(p);
            this.save();
        },
        
        addEvent: function(e) {
            e.id = Date.now().toString();
            this.events.push(e);
            this.save();
        },
        
        addGift: function(g) {
            g.id = Date.now().toString();
            this.gifts.push(g);
            this.save();
        },
        
        getUpcomingBirthdays: function(days) {
            days = days || 30;
            var now = new Date();
            var result = [];
            for (var i = 0; i < this.people.length; i++) {
                var p = this.people[i];
                if (!p.birthday) continue;
                var bday = new Date(p.birthday);
                var next = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
                if (next < now) next.setFullYear(now.getFullYear() + 1);
                var diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24));
                if (diff >= 0 && diff <= days) {
                    var copy = {};
                    for (var key in p) copy[key] = p[key];
                    copy.daysUntil = diff;
                    result.push(copy);
                }
            }
            result.sort(function(a, b) { return a.daysUntil - b.daysUntil; });
            return result;
        },
        
        getUpcomingEvents: function(days) {
            days = days || 30;
            var now = new Date();
            var result = [];
            for (var i = 0; i < this.events.length; i++) {
                var e = this.events[i];
                var d = new Date(e.date);
                var diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                if (diff >= 0 && diff <= days) {
                    var copy = {};
                    for (var key in e) copy[key] = e[key];
                    copy.daysUntil = diff;
                    result.push(copy);
                }
            }
            result.sort(function(a, b) { return a.daysUntil - b.daysUntil; });
            return result;
        },
        
        getGiftsForEvent: function(eventId) {
            var result = [];
            for (var i = 0; i < this.gifts.length; i++) {
                if (this.gifts[i].eventId === eventId) result.push(this.gifts[i]);
            }
            return result;
        },
        
        getStats: function() {
            var totalBudget = 0;
            for (var i = 0; i < this.events.length; i++) {
                totalBudget += parseFloat(this.events[i].budget) || 0;
            }
            var totalSpent = 0;
            for (var i = 0; i < this.gifts.length; i++) {
                totalSpent += parseFloat(this.gifts[i].price) || 0;
            }
            return {
                totalBudget: totalBudget,
                totalSpent: totalSpent,
                remaining: totalBudget - totalSpent,
                people: this.people.length,
                events: this.events.length,
                gifts: this.gifts.length
            };
        }
    };

    // Icons and colors
    var icons = {birthday: '\ud83c\udf82', anniversary: '\u2764\ufe0f', holiday: '\u2b50', other: '\ud83c\udf81'};
    var colors = {birthday: '#FF4D80', anniversary: '#FF3B30', holiday: '#FF9500', other: '#007AFF'};

    // Current state
    var currentTab = 'dashboard';

    // Initialize on load
    function init() {
        console.log('GiftTracker init started');
        store.load();
        
        // Hide splash after delay
        setTimeout(function() {
            console.log('Hiding splash...');
            var splash = document.getElementById('splash');
            if (splash) {
                splash.classList.add('hidden');
                setTimeout(function() {
                    splash.style.display = 'none';
                }, 500);
            }
            renderDashboard();
            console.log('Dashboard rendered');
        }, 1500);
    }

    // Try multiple init methods
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Tab switching
    window.switchTab = function(tab) {
        currentTab = tab;
        var tabs = document.querySelectorAll('.tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
        }
        event.target.closest('.tab').classList.add('active');
        
        if (tab === 'dashboard') renderDashboard();
        else if (tab === 'people') renderPeople();
        else if (tab === 'events') renderEvents();
        else if (tab === 'stats') renderStats();
    };

    // Render Dashboard
    function renderDashboard() {
        console.log('Rendering dashboard...');
        var stats = store.getStats();
        var birthdays = store.getUpcomingBirthdays();
        var events = store.getUpcomingEvents();
        
        var html = '<div style="padding:20px 16px">';
        
        // Welcome
        html += '<div style="margin-bottom:24px">';
        html += '<div style="font-size:28px;font-weight:700;margin-bottom:4px">\u041f\u0440\u0438\u0432\u0435\u0442! \ud83c\udf89</div>';
        html += '<div style="color:var(--ios-label2)">\u0412\u043e\u0442 \u0447\u0442\u043e \u043f\u0440\u043e\u0438\u0441\u0445\u043e\u0434\u0438\u0442 \u0441\u0435\u0439\u0447\u0430\u0441</div>';
        html += '</div>';
        
        // Birthdays
        if (birthdays.length > 0) {
            html += '<div style="margin-bottom:24px">';
            html += '<div style="font-size:20px;font-weight:600;margin-bottom:12px">\ud83c\udf82 \u0411\u043b\u0438\u0436\u0430\u0439\u0448\u0438\u0435 \u0434\u043d\u0438 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f</div>';
            html += '<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px">';
            for (var i = 0; i < Math.min(birthdays.length, 5); i++) {
                var p = birthdays[i];
                html += '<div class="card" style="min-width:160px;margin:0;cursor:pointer" onclick="renderPersonDetail(\'' + p.id + '\')">';
                html += '<div style="padding:16px">';
                html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">';
                html += '<span style="font-size:32px">\ud83d\udc64</span>';
                html += '<span class="badge">' + (p.daysUntil === 0 ? '\u0421\u0435\u0433\u043e\u0434\u043d\u044f!' : p.daysUntil + ' \u0434\u043d.') + '</span>';
                html += '</div>';
                html += '<div style="font-weight:600;font-size:15px">' + p.name + '</div>';
                html += '</div></div>';
            }
            html += '</div></div>';
        }
        
        // Events
        if (events.length > 0) {
            html += '<div style="margin-bottom:24px">';
            html += '<div style="font-size:20px;font-weight:600;margin-bottom:12px">\ud83c\udf81 \u0411\u043b\u0438\u0436\u0430\u0439\u0448\u0438\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u044f</div>';
            for (var j = 0; j < Math.min(events.length, 5); j++) {
                var e = events[j];
                html += '<div class="card" style="margin-bottom:8px;cursor:pointer" onclick="renderEventDetail(\'' + e.id + '\')">';
                html += '<div class="card-r">';
                html += '<div class="card-i" style="background:' + (colors[e.type] || colors.other) + '15;color:' + (colors[e.type] || colors.other) + '">' + (icons[e.type] || icons.other) + '</div>';
                html += '<div class="card-c">';
                html += '<div class="card-t">' + e.title + '</div>';
                html += '<div class="card-s">' + new Date(e.date).toLocaleDateString('ru-RU') + ' \u00b7 ' + e.daysUntil + ' \u0434\u043d.</div>';
                html += '</div>';
                if (e.budget > 0) html += '<div style="color:var(--ios-label2)">' + e.budget + ' $</div>';
                html += '</div></div>';
            }
            html += '</div>';
        }
        
        // Quick Actions
        html += '<div style="margin-bottom:24px">';
        html += '<div style="font-size:20px;font-weight:600;margin-bottom:12px">\u26a1 \u0411\u044b\u0441\u0442\u0440\u044b\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f</div>';
        html += '<div style="display:flex;gap:12px;padding:0 16px">';
        html += '<button class="btn btn2" onclick="renderAddPerson()">\ud83d\udc64 \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button>';
        html += '<button class="btn btn2" onclick="renderAddEvent()">\ud83d\udcc5 \u0421\u043e\u0431\u044b\u0442\u0438\u0435</button>';
        html += '</div></div>';
        
        // Stats
        html += '<div>';
        html += '<div style="font-size:20px;font-weight:600;margin-bottom:12px">\ud83d\udcca \u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430</div>';
        html += '<div style="display:flex;gap:12px;padding:0 16px">';
        html += '<div class="card" style="flex:1;margin:0"><div style="padding:16px"><div style="color:var(--ios-label2);font-size:13px;margin-bottom:4px">\u0411\u044e\u0434\u0436\u0435\u0442</div><div style="font-size:24px;font-weight:700;color:var(--ios-blue)">' + stats.totalBudget + ' $</div></div></div>';
        html += '<div class="card" style="flex:1;margin:0"><div style="padding:16px"><div style="color:var(--ios-label2);font-size:13px;margin-bottom:4px">\u041f\u043e\u0442\u0440\u0430\u0447\u0435\u043d\u043e</div><div style="font-size:24px;font-weight:700;color:var(--ios-green)">' + stats.totalSpent + ' $</div></div></div>';
        html += '</div></div>';
        
        html += '</div>';
        document.getElementById('content').innerHTML = html;
        console.log('Dashboard rendered');
    }

    // Render People
    window.renderPeople = function() {
        var html = '<div class="content">';
        
        html += '<div class="search"><div class="search-i"><span>\ud83d\udd0d</span><input type="text" placeholder="\u041f\u043e\u0438\u0441\u043a" oninput="filterPeople(this.value)"></div></div>';
        
        if (store.people.length > 0) {
            html += '<div id="people-list">';
            for (var i = 0; i < store.people.length; i++) {
                var p = store.people[i];
                var age = p.birthday ? new Date().getFullYear() - new Date(p.birthday).getFullYear() : null;
                html += '<div class="card" style="margin-bottom:1px;cursor:pointer" onclick="renderPersonDetail(\'' + p.id + '\')">';
                html += '<div class="card-r">';
                html += '<div class="card-i" style="background:#FF4D8015;color:#FF4D80;font-size:24px">\ud83d\udc64</div>';
                html += '<div class="card-c">';
                html += '<div class="card-t">' + p.name + '</div>';
                if (p.relationship) html += '<div class="card-s">' + p.relationship + '</div>';
                html += '</div>';
                if (age) html += '<div style="color:var(--ios-label2)">' + age + ' \u043b\u0435\u0442</div>';
                html += '<div style="color:var(--ios-label2)">&rsaquo;</div>';
                html += '</div></div>';
            }
            html += '</div>';
        } else {
            html += '<div class="empty">';
            html += '<div class="empty-i">\ud83d\udc64</div>';
            html += '<div class="empty-t">\u041d\u0435\u0442 \u043b\u044e\u0434\u0435\u0439</div>';
            html += '<div class="empty-s">\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0431\u043b\u0438\u0437\u043a\u0438\u0445</div>';
            html += '<button class="btn" style="margin-top:16px" onclick="renderAddPerson()">\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button>';
            html += '</div>';
        }
        
        html += '</div>';
        document.getElementById('content').innerHTML = html;
    };

    window.filterPeople = function(query) {
        var items = document.querySelectorAll('#people-list > div');
        for (var i = 0; i < items.length; i++) {
            items[i].style.display = items[i].textContent.toLowerCase().indexOf(query.toLowerCase()) >= 0 ? '' : 'none';
        }
    };

    window.renderPersonDetail = function(id) {
        var p = null;
        for (var i = 0; i < store.people.length; i++) {
            if (store.people[i].id === id) { p = store.people[i]; break; }
        }
        if (!p) return renderPeople();
        
        var age = p.birthday ? new Date().getFullYear() - new Date(p.birthday).getFullYear() : null;
        
        var html = '<div class="content">';
        html += '<div style="text-align:center;padding:32px 16px">';
        html += '<div style="font-size:80px;margin-bottom:12px">\ud83d\udc64</div>';
        html += '<div style="font-size:24px;font-weight:700;margin-bottom:4px">' + p.name + '</div>';
        if (p.relationship) html += '<div style="color:var(--ios-label2)">' + p.relationship + '</div>';
        html += '</div>';
        
        html += '<div class="card" style="margin-bottom:16px">';
        if (p.birthday) {
            html += '<div class="card-r"><span style="font-size:20px">\ud83c\udf82</span><div class="card-c"><div class="card-t">\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f</div><div class="card-s">' + new Date(p.birthday).toLocaleDateString('ru-RU') + '</div></div></div>';
        }
        if (age) {
            html += '<div class="card-r"><span style="font-size:20px">\ud83d\udcf1</span><div class="card-c"><div class="card-t">\u0412\u043e\u0437\u0440\u0430\u0441\u0442</div><div class="card-s">' + age + ' \u043b\u0435\u0442</div></div></div>';
        }
        if (p.notes) {
            html += '<div class="card-r"><span style="font-size:20px">\ud83d\udcdd</span><div class="card-c"><div class="card-t">\u0417\u0430\u043c\u0435\u0442\u043a\u0438</div><div class="card-s">' + p.notes + '</div></div></div>';
        }
        html += '</div>';
        
        html += '<button class="btn" onclick="renderAddEvent()">\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u0431\u044b\u0442\u0438\u0435</button>';
        html += '</div>';
        document.getElementById('content').innerHTML = html;
    };

    window.renderEvents = function() {
        var html = '<div class="content">';
        
        html += '<div style="display:flex;gap:8px;padding:12px 16px;overflow-x:auto">';
        html += '<span class="badge">\u0412\u0441\u0435</span>';
        html += '<span class="badge" style="background:var(--ios-fill);color:var(--ios-label2)">\u0411\u043b\u0438\u0436\u0430\u0439\u0448\u0438\u0435</span>';
        html += '<span class="badge" style="background:var(--ios-fill);color:var(--ios-label2)">\u0414\u043d\u0438 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f</span>';
        html += '</div>';
        
        if (store.events.length > 0) {
            for (var i = 0; i < store.events.length; i++) {
                var e = store.events[i];
                var d = new Date(e.date);
                var now = new Date();
                var diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
                html += '<div class="card" style="margin-bottom:1px;cursor:pointer" onclick="renderEventDetail(\'' + e.id + '\')">';
                html += '<div class="card-r">';
                html += '<div class="card-i" style="background:' + (colors[e.type] || colors.other) + '15;color:' + (colors[e.type] || colors.other) + '">' + (icons[e.type] || icons.other) + '</div>';
                html += '<div class="card-c">';
                html += '<div class="card-t">' + e.title + '</div>';
                html += '<div class="card-s">' + d.toLocaleDateString('ru-RU') + ' ' + (diff >= 0 ? '\u00b7 ' + diff + ' \u0434\u043d.' : '') + '</div>';
                html += '</div>';
                if (e.budget > 0) html += '<div style="color:var(--ios-label2)">' + e.budget + ' $</div>';
                html += '<div style="color:var(--ios-label2)">&rsaquo;</div>';
                html += '</div></div>';
            }
        } else {
            html += '<div class="empty">';
            html += '<div class="empty-i">\ud83d\udcc5</div>';
            html += '<div class="empty-t">\u041d\u0435\u0442 \u0441\u043e\u0431\u044b\u0442\u0438\u0439</div>';
            html += '<button class="btn" style="margin-top:16px" onclick="renderAddEvent()">\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button>';
            html += '</div>';
        }
        
        html += '</div>';
        document.getElementById('content').innerHTML = html;
    };

    window.renderEventDetail = function(id) {
        var e = null;
        for (var i = 0; i < store.events.length; i++) {
            if (store.events[i].id === id) { e = store.events[i]; break; }
        }
        if (!e) return renderEvents();
        
        var gifts = store.getGiftsForEvent(id);
        var spent = 0;
        for (var i = 0; i < gifts.length; i++) {
            spent += parseFloat(gifts[i].price) || 0;
        }
        var remaining = (parseFloat(e.budget) || 0) - spent;
        
        var html = '<div class="content">';
        html += '<div style="text-align:center;padding:32px 16px">';
        html += '<div style="font-size:60px;margin-bottom:12px">' + (icons[e.type] || icons.other) + '</div>';
        html += '<div style="font-size:24px;font-weight:700;margin-bottom:4px">' + e.title + '</div>';
        html += '<div style="color:var(--ios-label2)">' + new Date(e.date).toLocaleDateString('ru-RU') + '</div>';
        html += '</div>';
        
        if (e.budget > 0) {
            html += '<div class="card" style="margin-bottom:16px">';
            html += '<div style="padding:16px">';
            html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
            html += '<div><div style="color:var(--ios-label2);font-size:13px">\u0411\u044e\u0434\u0436\u0435\u0442</div><div style="font-size:20px;font-weight:700">' + e.budget + ' $</div></div>';
            html += '<div style="text-align:right"><div style="color:var(--ios-label2);font-size:13px">\u041f\u043e\u0442\u0440\u0430\u0447\u0435\u043d\u043e</div><div style="font-size:20px;font-weight:700;color:' + (remaining >= 0 ? '#34C759' : '#FF3B30') + '">' + spent + ' $</div></div>';
            html += '</div>';
            html += '<div class="progress"><div class="progress-f" style="width:' + Math.min((spent / e.budget) * 100, 100) + '%;background:' + (remaining >= 0 ? '#34C759' : '#FF3B30') + '"></div></div>';
            html += '</div></div>';
        }
        
        html += '<div style="margin-bottom:16px">';
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:0 16px;margin-bottom:12px">';
        html += '<div style="font-size:20px;font-weight:600">\ud83c\udf81 \u041f\u043e\u0434\u0430\u0440\u043a\u0438</div>';
        html += '<button style="background:none;border:none;color:var(--ios-blue);font-size:15px;cursor:pointer" onclick="showAddGift(\'' + e.id + '\')">+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c</button>';
        html += '</div>';
        
        if (gifts.length > 0) {
            for (var i = 0; i < gifts.length; i++) {
                var g = gifts[i];
                html += '<div class="card" style="margin-bottom:1px">';
                html += '<div class="card-r">';
                html += '<div class="card-i" style="background:' + (colors[g.status] || '#8E8E93') + '15;color:' + (colors[g.status] || '#8E8E93') + '">' + (icons[g.status] || '\u25cb') + '</div>';
                html += '<div class="card-c">';
                html += '<div class="card-t">' + g.name + '</div>';
                html += '<div class="card-s">' + (g.store || '') + ' \u00b7 ' + g.status + '</div>';
                html += '</div>';
                if (g.price > 0) html += '<div style="color:var(--ios-label2)">' + g.price + ' $</div>';
                html += '</div></div>';
            }
        } else {
            html += '<div class="empty" style="padding:32px">';
            html += '<div class="empty-i" style="font-size:48px">\ud83c\udf81</div>';
            html += '<div style="color:var(--ios-label2)">\u041d\u0435\u0442 \u043f\u043e\u0434\u0430\u0440\u043a\u043e\u0432</div>';
            html += '</div>';
        }
        
        html += '</div></div>';
        document.getElementById('content').innerHTML = html;
    };

    window.renderStats = function() {
        var stats = store.getStats();
        
        var html = '<div class="content"><div style="padding:20px 16px">';
        html += '<div style="font-size:28px;font-weight:700;margin-bottom:20px">\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430</div>';
        
        html += '<div style="display:flex;gap:12px;padding:0 16px;margin-bottom:20px">';
        html += '<div class="card" style="flex:1;margin:0"><div style="padding:16px"><div style="color:var(--ios-label2);font-size:13px;margin-bottom:4px">\u0411\u044e\u0434\u0436\u0435\u0442</div><div style="font-size:24px;font-weight:700;color:var(--ios-blue)">' + stats.totalBudget + ' $</div></div></div>';
        html += '<div class="card" style="flex:1;margin:0"><div style="padding:16px"><div style="color:var(--ios-label2);font-size:13px;margin-bottom:4px">\u041f\u043e\u0442\u0440\u0430\u0447\u0435\u043d\u043e</div><div style="font-size:24px;font-weight:700;color:var(--ios-green)">' + stats.totalSpent + ' $</div></div></div>';
        html += '</div>';
        
        html += '<div class="card" style="margin-bottom:20px"><div style="padding:16px">';
        html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px">';
        html += '<div><div style="color:var(--ios-label2);font-size:13px">\u041e\u0431\u0449\u0438\u0439 \u0431\u044e\u0434\u0436\u0435\u0442</div><div style="font-size:20px;font-weight:700">' + stats.totalBudget + ' $</div></div>';
        html += '<div style="text-align:right"><div style="color:var(--ios-label2);font-size:13px">\u041e\u0441\u0442\u0430\u043b\u043e\u0441\u044c</div><div style="font-size:20px;font-weight:700;color:' + (stats.remaining >= 0 ? '#34C759' : '#FF3B30') + '">' + stats.remaining + ' $</div></div>';
        html += '</div>';
        html += '<div class="progress"><div class="progress-f" style="width:' + (stats.totalBudget > 0 ? Math.min((stats.totalSpent / stats.totalBudget) * 100, 100) : 0) + '%;background:' + (stats.remaining >= 0 ? '#34C759' : '#FF3B30') + '"></div></div>';
        html += '</div></div>';
        
        html += '<div class="card" style="margin-bottom:20px">';
        html += '<div class="card-r"><span style="font-size:20px">\ud83d\udc65</span><div class="card-c"><div class="card-t">\u041b\u044e\u0434\u0435\u0439</div></div><div style="color:var(--ios-label2)">' + stats.people + '</div></div>';
        html += '<div class="card-r"><span style="font-size:20px">\ud83c\udf81</span><div class="card-c"><div class="card-t">\u0421\u043e\u0431\u044b\u0442\u0438\u0439</div></div><div style="color:var(--ios-label2)">' + stats.events + '</div></div>';
        html += '<div class="card-r"><span style="font-size:20px">\ud83c\udf8c</span><div class="card-c"><div class="card-t">\u041f\u043e\u0434\u0430\u0440\u043a\u043e\u0432</div></div><div style="color:var(--ios-label2)">' + stats.gifts + '</div></div>';
        html += '</div>';
        
        html += '<div><div style="font-size:20px;font-weight:600;margin-bottom:12px">\ud83d\udca1 \u0421\u043e\u0432\u0435\u0442\u044b</div>';
        html += '<div class="card" style="margin-bottom:12px"><div class="card-r"><span style="font-size:24px">\ud83d\udcc5</span><div class="card-c"><div class="card-t">\u041f\u043b\u0430\u043d\u0438\u0440\u0443\u0439\u0442\u0435 \u0437\u0430\u0440\u0430\u043d\u0435\u0435</div><div class="card-s">\u041f\u043e\u043a\u0443\u043f\u0430\u0439\u0442\u0435 \u043f\u043e\u0434\u0430\u0440\u043a\u0438 \u0437\u0430\u0440\u0430\u043d\u0435\u0435</div></div></div></div>';
        html += '<div class="card"><div class="card-r"><span style="font-size:24px">\ud83d\udcb0</span><div class="card-c"><div class="card-t">\u0421\u043b\u0435\u0434\u0438\u0442\u0435 \u0437\u0430 \u0431\u044e\u0434\u0436\u0435\u0442\u043e\u043c</div><div class="card-s">\u0423\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0439\u0442\u0435 \u043b\u0438\u043c\u0438\u0442 \u043d\u0430 \u043a\u0430\u0436\u0434\u043e\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u0435</div></div></div></div>';
        html += '</div>';
        
        html += '</div></div>';
        document.getElementById('content').innerHTML = html;
    };

    window.renderAddPerson = function() {
        var html = '<div class="content"><div style="padding:20px 16px">';
        html += '<div style="font-size:28px;font-weight:700;margin-bottom:20px">\u041d\u043e\u0432\u044b\u0439 \u0447\u0435\u043b\u043e\u0432\u0435\u043a</div>';
        
        html += '<div class="form">';
        html += '<div class="form-r"><label class="form-l">\u0418\u043c\u044f</label><input class="form-in" id="p-name" placeholder="\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043c\u044f"></div>';
        html += '<div class="form-r"><label class="form-l">\u0414\u0435\u043d\u044c \u0420</label><input class="form-in" id="p-bday" type="date" style="text-align:right"></div>';
        html += '<div class="form-r"><label class="form-l">\u041e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u044f</label><input class="form-in" id="p-rel" placeholder="\u0414\u0440\u0443\u0433, \u0440\u043e\u0434\u0441\u0442\u0432\u0435\u043d\u043d\u0438\u043a"></div>';
        html += '</div>';
        
        html += '<div class="form"><div class="form-r" style="align-items:flex-start"><label class="form-l" style="padding-top:12px">\u0417\u0430\u043c\u0435\u0442\u043a\u0438</label><textarea class="form-in" id="p-notes" rows="3" style="text-align:left;resize:none"></textarea></div></div>';
        
        html += '<button class="btn" style="margin-top:20px" onclick="savePerson()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button>';
        html += '</div></div>';
        document.getElementById('content').innerHTML = html;
    };

    window.savePerson = function() {
        var name = document.getElementById('p-name').value;
        if (!name) { alert('\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043c\u044f'); return; }
        store.addPerson({
            name: name,
            birthday: document.getElementById('p-bday').value,
            relationship: document.getElementById('p-rel').value,
            notes: document.getElementById('p-notes').value
        });
        renderPeople();
    };

    window.renderAddEvent = function() {
        var html = '<div class="content"><div style="padding:20px 16px">';
        html += '<div style="font-size:28px;font-weight:700;margin-bottom:20px">\u041d\u043e\u0432\u043e\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u0435</div>';
        
        html += '<div class="form">';
        html += '<div class="form-r"><label class="form-l">\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435</label><input class="form-in" id="e-title" placeholder="\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f..."></div>';
        html += '<div class="form-r"><label class="form-l">\u0414\u0430\u0442\u0430</label><input class="form-in" id="e-date" type="date" style="text-align:right"></div>';
        html += '<div class="form-r"><label class="form-l">\u0422\u0438\u043f</label><select class="form-in" id="e-type" style="text-align:right;border:none;background:none"><option value="birthday">\u0414\u0435\u043d\u044c \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f</option><option value="anniversary">\u0413\u043e\u0434\u043e\u0432\u0449\u0438\u043d\u0430</option><option value="holiday">\u041f\u0440\u0430\u0437\u0434\u043d\u0438\u043a</option><option value="other">\u0414\u0440\u0443\u0433\u043e\u0435</option></select></div>';
        html += '<div class="form-r"><label class="form-l">\u0411\u044e\u0434\u0436\u0435\u0442 ($)</label><input class="form-in" id="e-budget" type="number" placeholder="0" style="text-align:right"></div>';
        html += '</div>';
        
        html += '<button class="btn" style="margin-top:20px" onclick="saveEvent()">\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c</button>';
        html += '</div></div>';
        document.getElementById('content').innerHTML = html;
    };

    window.saveEvent = function() {
        var title = document.getElementById('e-title').value;
        var date = document.getElementById('e-date').value;
        if (!title || !date) { alert('\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0438 \u0434\u0430\u0442\u0443'); return; }
        store.addEvent({
            title: title,
            date: date,
            type: document.getElementById('e-type').value,
            budget: parseFloat(document.getElementById('e-budget').value) || 0
        });
        renderEvents();
    };

    window.showAddGift = function(eventId) {
        var name = prompt('\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043f\u043e\u0434\u0430\u0440\u043a\u0430:');
        if (!name) return;
        var price = parseFloat(prompt('\u0426\u0435\u043d\u0430 ($):') || 0);
        store.addGift({name: name, price: price, status: 'planned', eventId: eventId});
        renderEventDetail(eventId);
    };

})();
