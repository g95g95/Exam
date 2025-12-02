# -*- coding: utf-8 -*-
"""Flask API backend for the Electoral Monte Carlo Simulator."""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from Electoral_Montecarlo import MontecarloElectoral, ElectionData
import os

app = Flask(__name__, static_folder='static')
CORS(app)


@app.route('/')
def index():
    """Serve the main HTML page."""
    return send_from_directory('static', 'index.html')


@app.route('/static/<path:path>')
def serve_static(path):
    """Serve static files."""
    return send_from_directory('static', path)


@app.route('/api/simulate', methods=['POST'])
def simulate():
    """Run a Monte Carlo simulation with the provided configuration."""
    try:
        data = request.get_json()

        # Extract configuration
        name = data.get('name', 'Generic Election')
        seats = int(data.get('seats', 400))
        proportional_pct = float(data.get('proportional', 50)) / 100.0
        majoritarian_pct = float(data.get('majoritarian', 50)) / 100.0
        iterations = int(data.get('iterations', 1000))

        # Handle parties and coalitions
        parties_data = data.get('parties', [])
        coalitions_data = data.get('coalitions', [])

        # If there are coalitions, group parties by coalition
        if coalitions_data and any(c.get('parties', []) for c in coalitions_data):
            # Calculate coalition vote shares
            entities = []
            shares = []

            # Track which parties are in coalitions
            parties_in_coalitions = set()
            for coalition in coalitions_data:
                if coalition.get('parties'):
                    parties_in_coalitions.update(coalition['parties'])

            # Add coalitions
            for coalition in coalitions_data:
                if coalition.get('parties'):
                    coalition_share = 0.0
                    for party_name in coalition['parties']:
                        for p in parties_data:
                            if p['name'] == party_name:
                                coalition_share += float(p.get('share', 0)) / 100.0
                                break
                    entities.append(coalition['name'])
                    shares.append(coalition_share)

            # Add standalone parties (not in any coalition)
            for party in parties_data:
                if party['name'] not in parties_in_coalitions:
                    entities.append(party['name'])
                    shares.append(float(party.get('share', 0)) / 100.0)
        else:
            # No coalitions, use individual parties
            entities = [p['name'] for p in parties_data]
            shares = [float(p.get('share', 0)) / 100.0 for p in parties_data]

        # Validate we have at least one entity
        if not entities:
            return jsonify({'error': 'At least one party is required'}), 400

        # Create simulation
        simulator = MontecarloElectoral(election=name)
        simulator._set_data(
            name=name,
            parties=entities,
            proportional_shares=shares,
            proportional_coefficient=proportional_pct,
            majoritarian_coefficient=majoritarian_pct,
            seats=seats
        )

        # Validate
        try:
            simulator.check_import()
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

        # Run simulation
        results = simulator.complete_simulation(iterations=iterations)

        # Prepare response with detailed results
        result_list = []
        for entity, seat_count in sorted(results.items(), key=lambda x: x[1], reverse=True):
            # Find if this is a coalition and get its parties
            is_coalition = False
            member_parties = []
            for c in coalitions_data:
                if c['name'] == entity:
                    is_coalition = True
                    member_parties = c.get('parties', [])
                    break

            result_list.append({
                'name': entity,
                'seats': seat_count,
                'percentage': round(seat_count / seats * 100, 1) if seats > 0 else 0,
                'isCoalition': is_coalition,
                'memberParties': member_parties
            })

        return jsonify({
            'success': True,
            'results': result_list,
            'config': {
                'name': name,
                'totalSeats': seats,
                'proportional': proportional_pct * 100,
                'majoritarian': majoritarian_pct * 100,
                'iterations': iterations
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/parties-templates')
def get_parties_templates():
    """Get list of available party template files."""
    partiti_dir = os.path.join(os.path.dirname(__file__), 'Partiti')
    templates = []
    if os.path.exists(partiti_dir):
        for f in os.listdir(partiti_dir):
            if f.endswith('.json'):
                templates.append(f)
    return jsonify({'templates': templates})


@app.route('/api/parties-template/<filename>')
def get_parties_template(filename):
    """Get a specific party template JSON file."""
    partiti_dir = os.path.join(os.path.dirname(__file__), 'Partiti')
    if not filename.endswith('.json'):
        return jsonify({'error': 'Invalid file type'}), 400
    filepath = os.path.join(partiti_dir, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'Template not found'}), 404
    return send_from_directory(partiti_dir, filename)


@app.route('/api/validate', methods=['POST'])
def validate():
    """Validate election configuration without running simulation."""
    try:
        data = request.get_json()

        proportional = float(data.get('proportional', 50))
        majoritarian = float(data.get('majoritarian', 50))
        seats = int(data.get('seats', 400))
        parties = data.get('parties', [])

        errors = []

        # Check coefficient sum
        if proportional + majoritarian > 100:
            errors.append('La somma di proporzionale e maggioritario non può superare 100%')

        # Check seats
        if seats <= 0:
            errors.append('Il numero di seggi deve essere positivo')

        # Check parties
        if not parties:
            errors.append('Almeno un partito è richiesto')
        else:
            total_share = sum(float(p.get('share', 0)) for p in parties)
            if total_share > 100:
                errors.append('La somma delle percentuali dei partiti non può superare 100%')

            # Check for duplicate names
            names = [p['name'] for p in parties]
            if len(names) != len(set(names)):
                errors.append('I nomi dei partiti devono essere unici')

        if errors:
            return jsonify({'valid': False, 'errors': errors})

        return jsonify({'valid': True, 'errors': []})

    except Exception as e:
        return jsonify({'valid': False, 'errors': [str(e)]}), 500


if __name__ == '__main__':
    # Ensure static directory exists
    os.makedirs('static', exist_ok=True)
    app.run(debug=True, port=5000)
