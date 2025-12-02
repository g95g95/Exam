/**
 * Electoral Monte Carlo Simulator - Frontend Application
 */

// State management
const state = {
    parties: [],
    coalitions: [],
    draggedParty: null,
    partyIdCounter: 0,
    coalitionIdCounter: 0,
    partyColors: [
        '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#319795',
        '#3182ce', '#5a67d8', '#805ad5', '#d53f8c', '#718096',
        '#2d3748', '#4a5568', '#667eea', '#48bb78', '#ed8936'
    ]
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultParties();
    updateSummary();
    setupDragAndDrop();
    loadPartyTemplatesList();
});

/**
 * Initialize with some default parties
 */
function initializeDefaultParties() {
    addParty('Partito A', 30);
    addParty('Partito B', 25);
    addParty('Partito C', 20);
    addParty('Partito D', 15);
}

/**
 * Add a new party
 */
function addParty(name = null, share = 10, color = null, image = null) {
    const id = ++state.partyIdCounter;
    const partyName = name || `Partito ${id}`;
    const colorIndex = (id - 1) % state.partyColors.length;

    const party = {
        id,
        name: partyName,
        share: share,
        color: color || state.partyColors[colorIndex],
        image: image || null,
        coalitionId: null
    };

    state.parties.push(party);
    renderParties();
    updateUnassignedPartiesPool();
    updateSummary();
    validateShareSum();
}

/**
 * Remove a party
 */
function removeParty(id) {
    const index = state.parties.findIndex(p => p.id === id);
    if (index !== -1) {
        state.parties.splice(index, 1);
        renderParties();
        updateUnassignedPartiesPool();
        updateCoalitionsDisplay();
        updateSummary();
        validateShareSum();
    }
}

/**
 * Update party name
 */
function updatePartyName(id, name) {
    const party = state.parties.find(p => p.id === id);
    if (party) {
        party.name = name;
        updateUnassignedPartiesPool();
        updateCoalitionsDisplay();
    }
}

/**
 * Update party share
 */
function updatePartyShare(id, share) {
    const party = state.parties.find(p => p.id === id);
    if (party) {
        party.share = Math.max(0, Math.min(100, parseFloat(share) || 0));
        // Update the slider and input
        const slider = document.querySelector(`#party-slider-${id}`);
        const input = document.querySelector(`#party-input-${id}`);
        if (slider) slider.value = party.share;
        if (input) input.value = party.share;

        updateUnassignedPartiesPool();
        updateCoalitionsDisplay();
        updateSummary();
        validateShareSum();
    }
}

/**
 * Generate party indicator HTML (image or color)
 */
function getPartyIndicatorHtml(party, size = 'normal') {
    const sizeClass = size === 'small' ? 'party-color-indicator-small' : 'party-color-indicator';
    if (party.image) {
        return `<span class="${sizeClass} party-image-indicator" style="background-color: ${party.color}">
            <img src="${party.image}" alt="${party.name}" onerror="this.style.display='none'">
        </span>`;
    }
    return `<span class="${sizeClass}" style="background-color: ${party.color}"></span>`;
}

/**
 * Render all party cards
 */
function renderParties() {
    const container = document.getElementById('partiesContainer');
    container.innerHTML = '';

    state.parties.forEach(party => {
        const card = document.createElement('div');
        card.className = 'party-card';
        card.innerHTML = `
            <div class="party-card-header">
                ${getPartyIndicatorHtml(party)}
                <input type="text" class="party-name-input" value="${party.name}"
                       onchange="updatePartyName(${party.id}, this.value)"
                       placeholder="Nome partito">
                <button class="party-delete-btn" onclick="removeParty(${party.id})" title="Elimina partito">
                    &times;
                </button>
            </div>
            <div class="party-share-group">
                <label>Voti:</label>
                <input type="number" class="party-share-input" id="party-input-${party.id}"
                       value="${party.share}" min="0" max="100" step="0.1"
                       onchange="updatePartyShare(${party.id}, this.value)">
                <span>%</span>
                <input type="range" class="party-share-slider" id="party-slider-${party.id}"
                       value="${party.share}" min="0" max="100" step="0.1"
                       oninput="updatePartyShare(${party.id}, this.value)">
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Validate that share sum doesn't exceed 100%
 */
function validateShareSum() {
    const total = state.parties.reduce((sum, p) => sum + p.share, 0);
    const warning = document.getElementById('shareWarning');
    if (total > 100) {
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }
    return total <= 100;
}

/**
 * Add a new coalition
 */
function addCoalition(name = null) {
    const id = ++state.coalitionIdCounter;
    const coalitionName = name || `Coalizione ${id}`;

    const coalition = {
        id,
        name: coalitionName,
        parties: []
    };

    state.coalitions.push(coalition);
    renderCoalitions();
    updateSummary();
}

/**
 * Remove a coalition
 */
function removeCoalition(id) {
    const coalition = state.coalitions.find(c => c.id === id);
    if (coalition) {
        // Remove coalition assignment from parties
        coalition.parties.forEach(partyId => {
            const party = state.parties.find(p => p.id === partyId);
            if (party) {
                party.coalitionId = null;
            }
        });

        const index = state.coalitions.findIndex(c => c.id === id);
        state.coalitions.splice(index, 1);
        renderCoalitions();
        updateUnassignedPartiesPool();
        updateSummary();
    }
}

/**
 * Update coalition name
 */
function updateCoalitionName(id, name) {
    const coalition = state.coalitions.find(c => c.id === id);
    if (coalition) {
        coalition.name = name;
    }
}

/**
 * Add party to coalition
 */
function addPartyToCoalition(partyId, coalitionId) {
    const party = state.parties.find(p => p.id === partyId);
    const coalition = state.coalitions.find(c => c.id === coalitionId);

    if (party && coalition) {
        // Remove from previous coalition if any
        if (party.coalitionId !== null) {
            const prevCoalition = state.coalitions.find(c => c.id === party.coalitionId);
            if (prevCoalition) {
                const idx = prevCoalition.parties.indexOf(partyId);
                if (idx !== -1) {
                    prevCoalition.parties.splice(idx, 1);
                }
            }
        }

        // Add to new coalition
        party.coalitionId = coalitionId;
        if (!coalition.parties.includes(partyId)) {
            coalition.parties.push(partyId);
        }

        renderCoalitions();
        updateUnassignedPartiesPool();
        updateSummary();
    }
}

/**
 * Remove party from coalition
 */
function removePartyFromCoalition(partyId) {
    const party = state.parties.find(p => p.id === partyId);
    if (party && party.coalitionId !== null) {
        const coalition = state.coalitions.find(c => c.id === party.coalitionId);
        if (coalition) {
            const idx = coalition.parties.indexOf(partyId);
            if (idx !== -1) {
                coalition.parties.splice(idx, 1);
            }
        }
        party.coalitionId = null;

        renderCoalitions();
        updateUnassignedPartiesPool();
        updateSummary();
    }
}

/**
 * Render all coalitions
 */
function renderCoalitions() {
    const container = document.getElementById('coalitionsContainer');
    container.innerHTML = '';

    state.coalitions.forEach(coalition => {
        const totalShare = coalition.parties.reduce((sum, partyId) => {
            const party = state.parties.find(p => p.id === partyId);
            return sum + (party ? party.share : 0);
        }, 0);

        const card = document.createElement('div');
        card.className = 'coalition-card';
        card.dataset.coalitionId = coalition.id;
        card.innerHTML = `
            <div class="coalition-header">
                <input type="text" class="coalition-name-input" value="${coalition.name}"
                       onchange="updateCoalitionName(${coalition.id}, this.value)"
                       placeholder="Nome coalizione">
                <button class="party-delete-btn" onclick="removeCoalition(${coalition.id})" title="Elimina coalizione">
                    &times;
                </button>
            </div>
            <div class="coalition-parties" data-coalition-id="${coalition.id}">
                ${coalition.parties.length === 0 ?
                    '<span class="empty-coalition-text">Trascina qui i partiti</span>' :
                    coalition.parties.map(partyId => {
                        const party = state.parties.find(p => p.id === partyId);
                        if (!party) return '';
                        return `
                            <span class="coalition-party-tag" draggable="true" data-party-id="${party.id}">
                                ${getPartyIndicatorHtml(party, 'small')}
                                ${party.name} (${party.share}%)
                                <button class="remove-from-coalition" onclick="removePartyFromCoalition(${party.id})">&times;</button>
                            </span>
                        `;
                    }).join('')
                }
            </div>
            <div class="coalition-share">Totale: ${totalShare.toFixed(1)}%</div>
        `;
        container.appendChild(card);

        // Add drop zone listeners
        const dropZone = card.querySelector('.coalition-parties');
        setupDropZone(dropZone, coalition.id);
    });
}

/**
 * Update the unassigned parties pool
 */
function updateUnassignedPartiesPool() {
    const pool = document.getElementById('unassignedParties');
    const unassignedParties = state.parties.filter(p => p.coalitionId === null);

    pool.innerHTML = '';

    if (unassignedParties.length === 0) {
        pool.innerHTML = '<span class="empty-coalition-text">Tutti i partiti sono assegnati</span>';
        return;
    }

    unassignedParties.forEach(party => {
        const tag = document.createElement('span');
        tag.className = 'draggable-party';
        tag.draggable = true;
        tag.dataset.partyId = party.id;
        tag.innerHTML = `
            ${getPartyIndicatorHtml(party, 'small')}
            ${party.name}
            <span class="party-share-badge">${party.share}%</span>
        `;

        tag.addEventListener('dragstart', (e) => {
            state.draggedParty = party.id;
            e.dataTransfer.effectAllowed = 'move';
            tag.style.opacity = '0.5';
        });

        tag.addEventListener('dragend', () => {
            tag.style.opacity = '1';
            state.draggedParty = null;
        });

        pool.appendChild(tag);
    });
}

/**
 * Update coalitions display (when party data changes)
 */
function updateCoalitionsDisplay() {
    renderCoalitions();
}

/**
 * Setup drag and drop for unassigned parties pool
 */
function setupDragAndDrop() {
    const pool = document.getElementById('unassignedParties');

    pool.addEventListener('dragover', (e) => {
        e.preventDefault();
        pool.classList.add('drag-over');
    });

    pool.addEventListener('dragleave', () => {
        pool.classList.remove('drag-over');
    });

    pool.addEventListener('drop', (e) => {
        e.preventDefault();
        pool.classList.remove('drag-over');

        if (state.draggedParty !== null) {
            removePartyFromCoalition(state.draggedParty);
            state.draggedParty = null;
        }
    });
}

/**
 * Setup drop zone for a coalition
 */
function setupDropZone(element, coalitionId) {
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.parentElement.classList.add('drag-over');
    });

    element.addEventListener('dragleave', () => {
        element.parentElement.classList.remove('drag-over');
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.parentElement.classList.remove('drag-over');

        if (state.draggedParty !== null) {
            addPartyToCoalition(state.draggedParty, coalitionId);
            state.draggedParty = null;
        }
    });

    // Setup draggable tags in coalitions
    element.querySelectorAll('.coalition-party-tag').forEach(tag => {
        tag.addEventListener('dragstart', (e) => {
            state.draggedParty = parseInt(tag.dataset.partyId);
            e.dataTransfer.effectAllowed = 'move';
            tag.style.opacity = '0.5';
        });

        tag.addEventListener('dragend', () => {
            tag.style.opacity = '1';
            state.draggedParty = null;
        });
    });
}

/**
 * Update sliders display
 */
function updateSeatsDisplay() {
    const value = document.getElementById('seatsSlider').value;
    document.getElementById('seatsValue').textContent = value;
    document.getElementById('summarySeats').textContent = value;
}

/**
 * Update coefficient sliders with linked behavior
 */
function updateCoefficients(source) {
    const propSlider = document.getElementById('proportionalSlider');
    const majSlider = document.getElementById('majoritarianSlider');

    let propValue = parseFloat(propSlider.value);
    let majValue = parseFloat(majSlider.value);

    // Validate sum doesn't exceed 100
    if (propValue + majValue > 100) {
        if (source === 'proportional') {
            majValue = 100 - propValue;
            majSlider.value = majValue;
        } else {
            propValue = 100 - majValue;
            propSlider.value = propValue;
        }
    }

    // Update displays
    document.getElementById('proportionalValue').textContent = propValue + '%';
    document.getElementById('majoritarianValue').textContent = majValue + '%';
    document.getElementById('summaryProp').textContent = propValue + '%';
    document.getElementById('summaryMaj').textContent = majValue + '%';

    // Show/hide warning
    const warning = document.getElementById('coefficientWarning');
    if (propValue + majValue > 100) {
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }
}

/**
 * Handle election type change
 */
function handleElectionTypeChange() {
    const type = document.getElementById('electionType').value;
    const nameInput = document.getElementById('electionName');

    switch (type) {
        case 'italian2018':
            nameInput.value = 'Elezioni Italiane 2018';
            document.getElementById('seatsSlider').value = 630;
            document.getElementById('proportionalSlider').value = 61;
            document.getElementById('majoritarianSlider').value = 37;
            updateSeatsDisplay();
            updateCoefficients('proportional');

            // Set Italian 2018 parties
            state.parties = [];
            state.coalitions = [];
            state.partyIdCounter = 0;
            state.coalitionIdCounter = 0;

            addParty('M5S', 32.7);
            addParty('Lega', 17.4);
            addParty('Forza Italia', 14.0);
            addParty('FdI', 4.4);
            addParty('PD', 18.7);
            addParty('LeU', 3.0);

            // Create coalitions
            addCoalition('Centro-destra');
            addCoalition('Centro-sinistra');

            // Assign parties to coalitions
            const lega = state.parties.find(p => p.name === 'Lega');
            const fi = state.parties.find(p => p.name === 'Forza Italia');
            const fdi = state.parties.find(p => p.name === 'FdI');
            const pd = state.parties.find(p => p.name === 'PD');

            const cdx = state.coalitions.find(c => c.name === 'Centro-destra');
            const csx = state.coalitions.find(c => c.name === 'Centro-sinistra');

            if (lega && cdx) addPartyToCoalition(lega.id, cdx.id);
            if (fi && cdx) addPartyToCoalition(fi.id, cdx.id);
            if (fdi && cdx) addPartyToCoalition(fdi.id, cdx.id);
            if (pd && csx) addPartyToCoalition(pd.id, csx.id);

            break;

        case 'generic':
            nameInput.value = 'Generic Election';
            document.getElementById('seatsSlider').value = 400;
            document.getElementById('proportionalSlider').value = 50;
            document.getElementById('majoritarianSlider').value = 50;
            updateSeatsDisplay();
            updateCoefficients('proportional');

            // Reset to default parties
            state.parties = [];
            state.coalitions = [];
            state.partyIdCounter = 0;
            state.coalitionIdCounter = 0;
            initializeDefaultParties();
            renderCoalitions();
            break;

        case 'custom':
            nameInput.value = 'Elezione Personalizzata';
            break;
    }

    updateSummary();
}

/**
 * Update summary panel
 */
function updateSummary() {
    const name = document.getElementById('electionName').value || 'Generic Election';
    document.getElementById('summaryTitle').textContent = name;

    const partyCount = state.parties.length;
    const coalitionCount = state.coalitions.filter(c => c.parties.length > 0).length;

    document.getElementById('partiesCount').textContent = `${partyCount} partit${partyCount === 1 ? 'o' : 'i'}`;
    document.getElementById('coalitionsCount').textContent = `${coalitionCount} coalizion${coalitionCount === 1 ? 'e' : 'i'}`;
}

/**
 * Run the simulation
 */
async function runSimulation() {
    // Validate
    if (!validateShareSum()) {
        alert('La somma delle percentuali dei partiti supera 100%');
        return;
    }

    if (state.parties.length === 0) {
        alert('Aggiungi almeno un partito');
        return;
    }

    // Show spinner
    const btn = document.getElementById('simulateBtn');
    const spinner = document.getElementById('spinner');
    btn.disabled = true;
    spinner.classList.remove('hidden');

    try {
        // Prepare data
        const partiesData = state.parties.map(p => ({
            name: p.name,
            share: p.share
        }));

        const coalitionsData = state.coalitions
            .filter(c => c.parties.length > 0)
            .map(c => ({
                name: c.name,
                parties: c.parties.map(partyId => {
                    const party = state.parties.find(p => p.id === partyId);
                    return party ? party.name : null;
                }).filter(n => n !== null)
            }));

        const requestData = {
            name: document.getElementById('electionName').value || 'Generic Election',
            seats: parseInt(document.getElementById('seatsSlider').value),
            proportional: parseFloat(document.getElementById('proportionalSlider').value),
            majoritarian: parseFloat(document.getElementById('majoritarianSlider').value),
            iterations: parseInt(document.getElementById('iterations').value) || 1000,
            parties: partiesData,
            coalitions: coalitionsData
        };

        const response = await fetch('/api/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();

        if (result.success) {
            displayResults(result);
        } else {
            alert('Errore: ' + result.error);
        }

    } catch (error) {
        console.error('Simulation error:', error);
        alert('Errore durante la simulazione. Assicurati che il server sia attivo.');
    } finally {
        btn.disabled = false;
        spinner.classList.add('hidden');
    }
}

/**
 * Display simulation results
 */
function displayResults(result) {
    const container = document.getElementById('resultsContainer');
    const grid = document.getElementById('resultsGrid');

    container.classList.remove('hidden');
    grid.innerHTML = '';

    result.results.forEach(entity => {
        // Get color from party or coalition
        let color = '#3182ce';
        if (entity.isCoalition) {
            // For coalitions, use the first party's color
            const firstPartyName = entity.memberParties[0];
            const party = state.parties.find(p => p.name === firstPartyName);
            if (party) color = party.color;
        } else {
            const party = state.parties.find(p => p.name === entity.name);
            if (party) color = party.color;
        }

        const card = document.createElement('div');
        card.className = 'result-card' + (entity.isCoalition ? ' is-coalition' : '');
        card.style.borderLeftColor = color;
        card.innerHTML = `
            <div class="result-name">${entity.name}</div>
            <div class="result-seats">${entity.seats}</div>
            <div class="result-percentage">${entity.percentage}% dei seggi</div>
            ${entity.isCoalition && entity.memberParties.length > 0 ?
                `<div class="result-members">${entity.memberParties.join(', ')}</div>` : ''}
        `;
        grid.appendChild(card);
    });

    // Scroll to results
    container.scrollIntoView({ behavior: 'smooth' });
}

// Update election name in summary when changed
document.getElementById('electionName')?.addEventListener('input', updateSummary);

/**
 * Load available party templates list
 */
async function loadPartyTemplatesList() {
    try {
        const response = await fetch('/api/parties-templates');
        const data = await response.json();

        const select = document.getElementById('partyTemplateSelect');
        select.innerHTML = '<option value="">-- Carica Template --</option>';

        data.templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template;
            option.textContent = template.replace('.json', '').replace(/_/g, ' ');
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading templates:', error);
    }
}

/**
 * Load parties from selected template
 */
async function loadPartyTemplate() {
    const select = document.getElementById('partyTemplateSelect');
    const filename = select.value;

    if (!filename) {
        alert('Seleziona un template');
        return;
    }

    try {
        const response = await fetch(`/api/parties-template/${filename}`);
        const data = await response.json();

        // Reset current state
        state.parties = [];
        state.coalitions = [];
        state.partyIdCounter = 0;
        state.coalitionIdCounter = 0;

        // Update election name if provided
        if (data.name) {
            document.getElementById('electionName').value = data.name;
        }

        // Add parties from template
        if (data.parties) {
            data.parties.forEach(p => {
                addParty(p.name, p.share, p.color, p.image);
            });
        }

        // Add coalitions from template
        if (data.coalitions) {
            data.coalitions.forEach(c => {
                addCoalition(c.name);
                const coalition = state.coalitions.find(co => co.name === c.name);
                if (coalition && c.parties) {
                    c.parties.forEach(partyName => {
                        const party = state.parties.find(p => p.name === partyName);
                        if (party) {
                            addPartyToCoalition(party.id, coalition.id);
                        }
                    });
                }
            });
        }

        updateSummary();

    } catch (error) {
        console.error('Error loading template:', error);
        alert('Errore nel caricamento del template');
    }
}
