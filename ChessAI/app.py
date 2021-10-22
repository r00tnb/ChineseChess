from flask import Flask, request, jsonify
from chess_rule import ChessRule
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
rule:ChessRule = None

@app.route('/ai', methods=['POST'])
def chess_api():
    global rule
    data = request.get_json(True)
    chessboard = data.get('chessboard')
    if chessboard is None:
        return 400, 'error'
    
    round = data.get('round', 'red')
    if rule is None:
        rule = ChessRule(True if round=='red' else  False)
    
    rule.set_chessboard(chessboard)
    print(data)
    return jsonify([0, 0, 0, 1])



if __name__ == '__main__':
    app.run('127.0.0.1', 8000, debug=True)
    # rule = ChessRule()
    # print(rule.in_palace(0, 0), rule.in_palace(3, 0), rule.in_palace(3, 0, False))