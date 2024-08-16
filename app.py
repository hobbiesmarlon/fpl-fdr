from flask import Flask, jsonify, render_template, request
import requests

app = Flask(__name__)

# API URLs
FPL_BASE_URL = "https://fantasy.premierleague.com/api"
FIXTURES_URL = f"{FPL_BASE_URL}/fixtures/"
TEAMS_URL = f"{FPL_BASE_URL}/bootstrap-static/"

# Map team names to their short forms
team_short_form = {
    'Arsenal': 'ARS',
    'Aston Villa': 'AVL',
    'Bournemouth': 'BOU',
    'Brentford': 'BRE',
    'Brighton': 'BHA',
    'Chelsea': 'CHE',
    'Crystal Palace': 'CRY',
    'Everton': 'EVE',
    'Fulham': 'FUL',
    'Ipswich': 'IPS',
    'Liverpool': 'LIV',
    'Leicester': 'LEI',
    'Man City': 'MCI',
    'Man Utd': 'MUN',
    'Newcastle': 'NEW',
    "Nott'm Forest": 'NFO',
    'Southampton': 'SOU',
    'Spurs': 'TOT',
    'West Ham': 'WHU',
    'Wolves': 'WOL'
}


# Function to fetch FPL data
def get_fpl_data():
    fixtures_response = requests.get(FIXTURES_URL)
    teams_response = requests.get(TEAMS_URL)

    fixtures = fixtures_response.json()
    teams = {team['id']: team['name'] for team in teams_response.json()['teams']}

    events = teams_response.json()['events']
    current_gw = next(event for event in events if event['is_next'])['id']

    return fixtures, teams, current_gw


# Function to get team fixtures for a given range of gameweeks
def get_team_fixtures(start_gw, end_gw):
    fixtures, teams, current_gw = get_fpl_data()

    team_fixtures = {team: [] for team in teams.values()}
    team_difficulty = {team: 0 for team in teams.values()}
    badge_id_mapping = {
        'Arsenal': 3,
        'Aston Villa': 7,
        'Bournemouth': 91,
        'Brentford': 94,
        'Brighton': 36,
        'Chelsea': 8,
        'Crystal Palace': 31,
        'Everton': 11,
        'Fulham': 54,
        'Ipswich': 40,
        'Leicester': 13,
        'Liverpool': 14,
        'Man City': 43,
        'Man Utd': 1,
        'Newcastle': 4,
        "Nott'm Forest": 17,
        'Southampton': 20,
        'Spurs': 6,
        'West Ham': 21,
        'Wolves': 39
    }

    team_badge_ids = {team: badge_id_mapping[team] for team in teams.values()}

    for fixture in fixtures:
        home_team_id = fixture['team_h']
        away_team_id = fixture['team_a']

        if fixture['event'] is None:
            continue

        if start_gw <= fixture['event'] <= end_gw:
            home_team = teams[home_team_id]
            away_team = teams[away_team_id]

            opponent_for_home = team_short_form.get(away_team, away_team)
            opponent_for_away = team_short_form.get(home_team, home_team)

            difficulty_home = fixture['team_h_difficulty']
            difficulty_away = fixture['team_a_difficulty']

            team_fixtures[home_team].append([fixture['event'],
                                             opponent_for_home,
                                             difficulty_home, True])
            team_difficulty[home_team] += difficulty_home

            team_fixtures[away_team].append([fixture['event'],
                                             opponent_for_away,
                                             difficulty_away, False])
            team_difficulty[away_team] += difficulty_away

    sorted_teams = sorted(team_fixtures.keys(), key=lambda x: team_difficulty[x])

    return {
        'sorted_teams': sorted_teams,
        'team_fixtures': team_fixtures,
        'team_difficulty': team_difficulty,
        'team_badge_ids': team_badge_ids
    }


# Route for the main page
@app.route('/')
def index():
    # Get the data and current gameweek
    fixtures, teams, current_gw = get_fpl_data()

    # Set default start and end gameweeks
    start_gw = current_gw
    end_gw = min(current_gw + 5, 38)

    # Pass the default gameweeks to the template
    return render_template('index.html', start_gw=start_gw, end_gw=end_gw)


# Route to return fixture data
@app.route('/fixtures')
def fixtures():
    start_gw = int(request.args.get('start_gw', 1))
    end_gw = int(request.args.get('end_gw', 6))
    data = get_team_fixtures(start_gw, end_gw)
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
