// State
let currentTournamentId = null;
let prizeTemplates = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        
        if (data.authenticated) {
            showDashboard(data.username);
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLogin();
    }
}

// Event Listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Create tournament form
    document.getElementById('createTournamentForm').addEventListener('submit', handleCreateTournament);
    
    // Add participant form
    document.getElementById('addParticipantForm').addEventListener('submit', handleAddParticipant);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showDashboard(data.username);
        } else {
            errorDiv.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
    }
}

// Logout
async function handleLogout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        showLogin();
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Show login screen
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboardScreen').style.display = 'none';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').textContent = '';
}

// Show dashboard
async function showDashboard(username) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    document.getElementById('usernameDisplay').textContent = `Hello, ${username}`;
    
    await loadPrizeTemplates();
    loadTournaments();
}

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    if (tabName === 'tournaments') {
        loadTournaments();
    }
}

// Load prize templates
async function loadPrizeTemplates() {
    try {
        const response = await fetch('/api/templates');
        prizeTemplates = await response.json();
        
        const select = document.getElementById('prizeTemplate');
        select.innerHTML = prizeTemplates.map(t => 
            `<option value="${t.name}">${t.name} - ${t.description}</option>`
        ).join('');
    } catch (error) {
        console.error('Failed to load templates:', error);
    }
}

// Create tournament
async function handleCreateTournament(e) {
    e.preventDefault();
    
    const tournamentData = {
        name: document.getElementById('tournamentName').value,
        mode: document.getElementById('tournamentMode').value,
        total_slots: parseInt(document.getElementById('totalSlots').value),
        entry_fee: parseFloat(document.getElementById('entryFee').value),
        prize_template: document.getElementById('prizeTemplate').value,
        organizer_commission: parseFloat(document.getElementById('organizerCommission').value)
    };
    
    try {
        const response = await fetch('/api/tournaments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tournamentData)
        });
        
        if (response.ok) {
            alert('Tournament created successfully!');
            document.getElementById('createTournamentForm').reset();
            switchTab('tournaments');
        } else {
            alert('Failed to create tournament');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Load tournaments
async function loadTournaments() {
    try {
        const response = await fetch('/api/tournaments');
        const tournaments = await response.json();
        
        const listDiv = document.getElementById('tournamentsList');
        
        if (tournaments.length === 0) {
            listDiv.innerHTML = `
                <div class="empty-state">
                    <h3>No tournaments yet</h3>
                    <p>Create your first tournament to get started</p>
                </div>
            `;
            return;
        }
        
        listDiv.innerHTML = tournaments.map(t => `
            <div class="tournament-item" onclick="showTournamentDetails(${t.id})">
                <h3>${t.name}</h3>
                <span class="status-badge status-${t.status}">${t.status.toUpperCase()}</span>
                <div class="tournament-info">
                    <span><strong>Mode:</strong> ${t.mode}</span>
                    <span><strong>Slots:</strong> ${t.total_slots}</span>
                    <span><strong>Entry Fee:</strong> ₹${t.entry_fee}</span>
                    <span><strong>Prize:</strong> ${t.prize_template}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load tournaments:', error);
    }
}

// Show tournament details
async function showTournamentDetails(tournamentId) {
    currentTournamentId = tournamentId;
    
    try {
        const response = await fetch(`/api/tournaments/${tournamentId}`);
        const data = await response.json();
        
        const modal = document.getElementById('tournamentModal');
        const detailsDiv = document.getElementById('tournamentDetails');
        
        detailsDiv.innerHTML = `
            <h2>${data.tournament.name}</h2>
            <p><strong>Mode:</strong> ${data.tournament.mode} | <strong>Status:</strong> ${data.tournament.status}</p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total Slots</h4>
                    <div class="value">${data.stats.totalSlots}</div>
                </div>
                <div class="stat-card">
                    <h4>Filled Slots</h4>
                    <div class="value">${data.stats.filledSlots}</div>
                </div>
                <div class="stat-card">
                    <h4>Paid Slots</h4>
                    <div class="value">${data.stats.paidSlots}</div>
                </div>
                <div class="stat-card">
                    <h4>Entry Fee</h4>
                    <div class="value">₹${data.tournament.entry_fee}</div>
                </div>
                <div class="stat-card">
                    <h4>Total Collection</h4>
                    <div class="value prize">₹${data.stats.totalCollection.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h4>Commission</h4>
                    <div class="value">₹${data.stats.commission.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h4>Net Prize Pool</h4>
                    <div class="value prize">₹${data.stats.netPrizePool.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h4>Prize Template</h4>
                    <div class="value" style="font-size: 16px;">${data.tournament.prize_template}</div>
                </div>
            </div>
            
            <h3>Participants</h3>
            ${data.participants.length === 0 ? '<p>No participants yet</p>' : `
                <table class="participant-table">
                    <thead>
                        <tr>
                            <th>Team/Player</th>
                            <th>WhatsApp</th>
                            <th>In-Game ID</th>
                            <th>Payment</th>
                            <th>Position</th>
                            <th>Prize</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.participants.map(p => `
                            <tr>
                                <td>${p.team_name}</td>
                                <td>${p.whatsapp_number || '-'}</td>
                                <td>${p.ingame_id || '-'}</td>
                                <td class="payment-${p.payment_status}">${p.payment_status.toUpperCase()}</td>
                                <td>${p.position > 0 ? `#${p.position}` : '-'}</td>
                                <td>${p.prize_amount > 0 ? `₹${p.prize_amount.toFixed(2)}` : '-'}</td>
                                <td>
                                    ${p.payment_status === 'pending' ? 
                                        `<button class="btn btn-small btn-success" onclick="updatePaymentStatus(${p.id}, 'paid')">Mark Paid</button>` :
                                        `<button class="btn btn-small btn-secondary" onclick="updatePaymentStatus(${p.id}, 'pending')">Mark Pending</button>`
                                    }
                                    <button class="btn btn-small btn-danger" onclick="deleteParticipant(${p.id})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
            
            <div class="actions">
                <button class="btn btn-primary" onclick="showAddParticipantModal()">Add Participant</button>
                ${data.tournament.status === 'active' && data.stats.paidSlots > 0 ? 
                    `<button class="btn btn-success" onclick="showResultsModal()">Enter Results</button>` : ''
                }
                <button class="btn btn-secondary" onclick="showSummary()">View Summary</button>
            </div>
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Failed to load tournament details:', error);
        alert('Failed to load tournament details');
    }
}

// Show add participant modal
function showAddParticipantModal() {
    document.getElementById('tournamentModal').style.display = 'none';
    document.getElementById('participantModal').style.display = 'block';
    document.getElementById('addParticipantForm').reset();
}

// Add participant
async function handleAddParticipant(e) {
    e.preventDefault();
    
    const participantData = {
        team_name: document.getElementById('teamName').value,
        whatsapp_number: document.getElementById('whatsappNumber').value,
        ingame_id: document.getElementById('ingameId').value,
        payment_status: document.getElementById('paymentStatus').value
    };
    
    try {
        const response = await fetch(`/api/tournaments/${currentTournamentId}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(participantData)
        });
        
        if (response.ok) {
            document.getElementById('participantModal').style.display = 'none';
            showTournamentDetails(currentTournamentId);
        } else {
            alert('Failed to add participant');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Update payment status
async function updatePaymentStatus(participantId, status) {
    try {
        const response = await fetch(`/api/participants/${participantId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_status: status })
        });
        
        if (response.ok) {
            showTournamentDetails(currentTournamentId);
        } else {
            alert('Failed to update payment status');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Delete participant
async function deleteParticipant(participantId) {
    if (!confirm('Are you sure you want to delete this participant?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/participants/${participantId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showTournamentDetails(currentTournamentId);
        } else {
            alert('Failed to delete participant');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Show results modal
async function showResultsModal() {
    try {
        const response = await fetch(`/api/tournaments/${currentTournamentId}`);
        const data = await response.json();
        
        const paidParticipants = data.participants.filter(p => p.payment_status === 'paid');
        
        if (paidParticipants.length === 0) {
            alert('No paid participants to assign results');
            return;
        }
        
        // Get prize template
        const template = prizeTemplates.find(t => t.name === data.tournament.prize_template);
        const positions = Object.keys(template.distribution).map(Number);
        
        const modal = document.getElementById('resultsModal');
        const formDiv = document.getElementById('resultsForm');
        
        formDiv.innerHTML = `
            <p>Select winners for each position:</p>
            ${positions.map(pos => `
                <div class="winner-input">
                    <label>Position ${pos}:</label>
                    <select id="winner${pos}">
                        <option value="">-- Select Team --</option>
                        ${paidParticipants.map(p => 
                            `<option value="${p.id}">${p.team_name}</option>`
                        ).join('')}
                    </select>
                </div>
            `).join('')}
            <div class="actions">
                <button class="btn btn-primary" onclick="submitResults()">Submit Results</button>
                <button class="btn btn-secondary" onclick="closeResultsModal()">Cancel</button>
            </div>
        `;
        
        document.getElementById('tournamentModal').style.display = 'none';
        modal.style.display = 'block';
    } catch (error) {
        console.error('Failed to show results modal:', error);
    }
}

// Close results modal
function closeResultsModal() {
    document.getElementById('resultsModal').style.display = 'none';
    showTournamentDetails(currentTournamentId);
}

// Submit results
async function submitResults() {
    try {
        const response = await fetch(`/api/tournaments/${currentTournamentId}`);
        const data = await response.json();
        const template = prizeTemplates.find(t => t.name === data.tournament.prize_template);
        const positions = Object.keys(template.distribution).map(Number);
        
        const winners = [];
        const selectedIds = new Set();
        
        for (const pos of positions) {
            const participantId = document.getElementById(`winner${pos}`).value;
            if (!participantId) {
                alert(`Please select a winner for position ${pos}`);
                return;
            }
            
            if (selectedIds.has(participantId)) {
                alert('Same team cannot win multiple positions');
                return;
            }
            
            selectedIds.add(participantId);
            winners.push({ participantId: parseInt(participantId), position: pos });
        }
        
        const submitResponse = await fetch(`/api/tournaments/${currentTournamentId}/results`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winners })
        });
        
        if (submitResponse.ok) {
            alert('Results submitted successfully!');
            document.getElementById('resultsModal').style.display = 'none';
            showTournamentDetails(currentTournamentId);
        } else {
            alert('Failed to submit results');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Show summary
async function showSummary() {
    try {
        const response = await fetch(`/api/tournaments/${currentTournamentId}/summary`);
        const data = await response.json();
        
        const modal = document.getElementById('summaryModal');
        const contentDiv = document.getElementById('summaryContent');
        
        contentDiv.innerHTML = `
            <h3>Tournament Statistics</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total Collection</h4>
                    <div class="value prize">₹${data.stats.totalCollection.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h4>Commission</h4>
                    <div class="value">₹${data.stats.commission.toFixed(2)}</div>
                </div>
                <div class="stat-card">
                    <h4>Net Prize Pool</h4>
                    <div class="value prize">₹${data.stats.netPrizePool.toFixed(2)}</div>
                </div>
            </div>
            
            ${data.winners.length > 0 ? `
                <h3>Winners</h3>
                <table class="participant-table">
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Team/Player</th>
                            <th>Prize Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.winners.map(w => `
                            <tr>
                                <td>#${w.position}</td>
                                <td>${w.team_name}</td>
                                <td>₹${w.prize_amount.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>No results declared yet</p>'}
            
            <h3>WhatsApp Summary</h3>
            <div class="summary-text" id="whatsappText">${data.whatsappSummary}</div>
            
            <button class="btn btn-primary copy-btn" onclick="copySummary()">Copy to Clipboard</button>
        `;
        
        document.getElementById('tournamentModal').style.display = 'none';
        modal.style.display = 'block';
    } catch (error) {
        console.error('Failed to load summary:', error);
        alert('Failed to load summary');
    }
}

// Copy summary to clipboard
function copySummary() {
    const text = document.getElementById('whatsappText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Summary copied to clipboard! You can now paste it in WhatsApp.');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}
