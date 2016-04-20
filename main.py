#!flask/bin/python
from flask import Flask, jsonify, request
import json

app = Flask(__name__, static_url_path='')
#app.config.from_object('config')

#api = restful.Api(app)

users = [
    {
        'firstname': u'Patrick',
        'lastname': u'Noble',
        'age': 24, 
        'id': u'2u3uh4iu3h343iu4h',
    },
    {
        'firstname': u'Robyn',
        'lastname': u'Cromwell',
        'age': 28,
        'id': u'2iuh3i3u2h3i2u3h2iu3',
    }
]

@app.after_request
def after_request(response):
    response.headers.add('Acess-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    b = 'user not found'
    for cur in users:
        if cur['id'] == user_id:
            b = json.dumps(cur)
    return b

@app.route('/users/<user_id>', methods=['PUT'])
def put_user(user_id):
    b = 'OK'
    for user in users:
        if user['id'] == user_id:
            user = request.json
            return json.dumps(users)


@app.route('/users', methods=['GET'])
def get_users():
    return json.dumps(users)

@app.route('/users', methods=['POST'])
def post_users():
    users.append(request.json)
    return json.dumps(users)

@app.route('/helloworld', methods=['GET'])
def helloWorld():
    return 'Hello World'

@app.route('/', methods=['GET'])
def root():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=80)
