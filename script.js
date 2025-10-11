class ReservationApp {
    constructor() {
        this.selectedName = '';
        this.reservations = [];
        this.maxReservations = 10;
        this.currentSelectedDate = null;
        this.currentSelectedTimeSlot = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateCalendar();
        this.updateReservationInfo();
    }

    setupEventListeners() {
        // Sélection du nom
        document.getElementById('nameSelect').addEventListener('change', (e) => {
            this.selectedName = e.target.value;
            this.updateReservationInfo();
        });

        // Modal
        const modal = document.getElementById('timeSlotModal');
        const closeBtn = document.querySelector('.close');
        const cancelBtn = document.getElementById('cancelReservation');

        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Créneaux horaires
        document.querySelectorAll('.time-slot').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectTimeSlot(e.target);
            });
        });

        // Confirmation de réservation
        document.getElementById('confirmReservation').addEventListener('click', () => {
            this.confirmReservation();
        });
    }

    generateCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        const months = [
            { name: 'Octobre 2025', year: 2025, month: 9 }, // 9 = octobre (0-indexé)
            { name: 'Novembre 2025', year: 2025, month: 10 },
            { name: 'Décembre 2025', year: 2025, month: 11 }
        ];

        months.forEach(monthData => {
            const monthDiv = document.createElement('div');
            monthDiv.className = 'month';
            
            const monthTitle = document.createElement('h2');
            monthTitle.textContent = monthData.name;
            monthDiv.appendChild(monthTitle);

            const calendarGrid = this.createMonthGrid(monthData.year, monthData.month);
            monthDiv.appendChild(calendarGrid);
            
            calendar.appendChild(monthDiv);
        });
    }

    createMonthGrid(year, month) {
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        // En-têtes des jours
        const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            grid.appendChild(header);
        });

        // Obtenir le premier jour du mois et le nombre de jours
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convertir dimanche=0 vers lundi=0

        // Ajouter des cellules vides pour aligner le premier jour
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            grid.appendChild(emptyCell);
        }

        // Ajouter les jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.textContent = day;
            
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            
            // Vérifier si c'est un mercredi (3) ou samedi (6)
            if (dayOfWeek === 3 || dayOfWeek === 6) {
                dayCell.classList.add('selectable');
                dayCell.addEventListener('click', () => this.openTimeSlotModal(date));
            } else {
                dayCell.classList.add('disabled');
            }

            // Vérifier s'il y a déjà une réservation pour ce jour
            this.updateDayCellAppearance(dayCell, date);
            
            grid.appendChild(dayCell);
        }

        return grid;
    }

    updateDayCellAppearance(dayCell, date) {
        const dateStr = this.formatDate(date);
        const reservation = this.reservations.find(r => r.date === dateStr);
        
        if (reservation) {
            dayCell.classList.add('reserved');
            dayCell.innerHTML = `
                <div class="day-number">${date.getDate()}</div>
                <div class="reservation-info">
                    <div class="reservation-name">${reservation.name}</div>
                    <div class="reservation-time">${reservation.timeSlot}</div>
                </div>
            `;
        }
    }

    openTimeSlotModal(date) {
        if (!this.selectedName) {
            alert('Veuillez d\'abord sélectionner votre nom.');
            return;
        }

        if (this.reservations.length >= this.maxReservations) {
            alert(`Vous avez déjà réservé le maximum de ${this.maxReservations} créneaux.`);
            return;
        }

        const dateStr = this.formatDate(date);
        const existingReservation = this.reservations.find(r => r.date === dateStr);
        
        if (existingReservation) {
            alert('Ce jour est déjà réservé.');
            return;
        }

        this.currentSelectedDate = date;
        document.getElementById('selectedDate').textContent = 
            `Réservation pour le ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        
        // Réinitialiser la sélection du créneau
        document.querySelectorAll('.time-slot').forEach(btn => {
            btn.classList.remove('selected');
        });
        this.currentSelectedTimeSlot = null;
        
        document.getElementById('timeSlotModal').style.display = 'block';
    }

    selectTimeSlot(button) {
        // Désélectionner tous les autres boutons
        document.querySelectorAll('.time-slot').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Sélectionner le bouton cliqué
        button.classList.add('selected');
        this.currentSelectedTimeSlot = button.dataset.time;
    }

    confirmReservation() {
        if (!this.currentSelectedTimeSlot) {
            alert('Veuillez sélectionner un créneau horaire.');
            return;
        }

        const dateStr = this.formatDate(this.currentSelectedDate);
        const timeSlot = this.currentSelectedTimeSlot.replace('-', 'h - ') + 'h';
        
        this.reservations.push({
            date: dateStr,
            name: this.selectedName,
            timeSlot: timeSlot
        });

        this.updateReservationInfo();
        this.generateCalendar(); // Re-générer pour afficher la réservation
        this.closeModal();
    }

    closeModal() {
        document.getElementById('timeSlotModal').style.display = 'none';
        this.currentSelectedDate = null;
        this.currentSelectedTimeSlot = null;
    }

    updateReservationInfo() {
        document.getElementById('reservationCount').textContent = this.reservations.length;
        document.getElementById('selectedName').textContent = this.selectedName || 'Aucun';
    }

    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new ReservationApp();
});

