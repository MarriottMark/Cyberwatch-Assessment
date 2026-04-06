from flask import Flask, request, render_template, redirect, url_for
from sqlalchemy import create_engine, text

app = Flask(__name__)

engine = create_engine('sqlite:///.database/cyberwatch.db') #link to the cyberwatch database here

#route for index.html

@app.route('/')
def home():
    
    with engine.connect() as connection:
        # This way of connecting to the database 
        # ensures that the connection is automatically closed as soon as the function finishes
        query = text('SELECT * FROM vulnerabilities ORDER BY owasp_rank;')
        result = connection.execute(query).fetchall()

    return render_template('index.html', vulnerabilities=result)

@app.route('/incidents/<vul_id>')
def incident_page(vul_id):
    # TASK 1: Connect to the database

    # TASK 2: Fetch the Vulnerability Name for the heading (JOIN or separate query)

    # TASK 3: Fetch all Incidents linked to this vul_id, return incidents list
 
    with engine.connect() as connect:
        query = text('SELECT vul_name FROM vulnerabilities WHERE id = :vul_id')
        vunrebilityname = connect.execute(query, {"vul_id":vul_id}).fetchone()


    with engine.connect() as connect:
        query = text('SELECT inc_name, inc_url, inc_year FROM incidents WHERE vul_id = :vul_id')
        incidents = connect.execute(query, {"vul_id":vul_id}).mappings().all()



    
    print(vul_id) #this is a print statement to help you understand what data is being returned
    return render_template('incidents.html', vulnerability = vunrebilityname, incidents = incidents)


@app.route('/add-incident', methods=['GET'])
def add_incident():
    with engine.connect() as connect:
        query = text("SELECT id, vul_name FROM vulnerabilities")
        vulnerabilities = connect.execute(query).fetchall()

    return render_template('add-incident.html', vulnerabilities=vulnerabilities)


@app.route('/incidents', methods=['POST'])
def create_incident():
    vul_id = request.form['vul_id']
    inc_name = request.form['inc_name']
    inc_url = request.form['inc_url']
    inc_year = request.form['inc_year']

    with engine.connect() as connect:
        query = text(" INSERT INTO incidents (vul_id, inc_name, inc_url, inc_year) VALUES (:vul_id, :inc_name, :inc_url, :inc_year)")
        connect.execute(query, {
            "vul_id": vul_id,
            "inc_name": inc_name,
            "inc_url": inc_url,
            "inc_year": inc_year
        })
        connect.commit()

    return redirect(url_for('add_incident'))

@app.route('/privacy', methods=['GET'])
def privacy():
    return render_template('privacy.html')


@app.route('/fulllist.html')
def fulllist():
    year = request.args.get('year', '').strip()
    error_message = None

    with engine.connect() as connection:
        if year == '':
            query = text('SELECT * FROM incidents ORDER BY inc_year DESC;')
            result = connection.execute(query).fetchall()

        elif year.isdigit() and 1900 <= int(year) <= 2100:
            query = text('SELECT * FROM incidents WHERE inc_year = :year ORDER BY inc_year DESC;')
            result = connection.execute(query, {"year": int(year)}).fetchall()

        else:
            result = []
            error_message = "Please enter a valid year between 1900 and 2100."

    return render_template(
        'fulllist.html',
        incidents=result,
        selected_year=year,
        error_message=error_message
    )


app.run(debug=True, reloader_type='stat', port=5000)