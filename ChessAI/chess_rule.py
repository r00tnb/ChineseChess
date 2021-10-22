
from typing import List, Tuple


class ChessRule:
    '''实现中国象棋着子规则, 自己的一方永远在棋盘下方
    '''
    def __init__(self, is_red=False) -> None:
        self.isred = is_red # 当前是否是红方

        self.__chess_map = {
            1:'車', 2:'马', 3:'相', 4:'仕', 5:'帅',6:'炮',7:'兵',# 红方
            11:'車', 12:'马', 13:'象', 14:'士', 15:'将',16:'炮',17:'卒', # 蓝方
        }
        self.__board_map = self.get_initial_chessboard(is_red)

    def get_initial_chessboard(self, red_below=False)->List[List[int]]:
        """返回初始棋盘

        Args:
            red_below (bool, optional): 为真则红方在棋盘下方，否则在上方. Defaults to False.

        Returns:
            List[List[int]]: 返回棋盘
        """
        board = [# 棋盘原点在左上角，向右为x轴正方向，向下为y轴正方向
            [1, 2, 3, 4, 5, 4, 3, 2, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 6, 0, 0, 0, 0, 0, 6, 0],
            [7, 0, 7, 0, 7, 0, 7, 0, 7],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [17, 0, 17, 0, 17, 0, 17, 0, 17],
            [0, 16, 0, 0, 0, 0, 0, 16, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [11, 12, 13, 14, 15, 14, 13, 12, 11],
        ]
        if red_below:
            board.reverse()

        return board

    def set_chessboard(self, board:List[List[int]]):
        self.__board_map = board

    def next_step(self, x:int, y:int)->List[Tuple[int, int]]:
        """获取棋子下一步可着子的点的列表

        Args:
            x (int): 棋子的x坐标
            y (int): 棋子的y坐标

        Returns:
            List[Tuple[int, int]]: 下一步可着子的点的列表
        """
        ret = []
        try:
            chess = self.get_chess(x, y)
        except:
            return ret
        
        square = chess%10
        if square == 1:
            ret = self.__che_rule(chess, x, y)
        elif square == 2:
            ret = self.__ma_rule(chess, x, y)
        elif square == 3:
            ret = self.__xiang_rule(chess, x, y)
        elif square == 4:
            ret = self.__shi_rule(chess, x, y)
        elif square == 5:
            ret = self.__jiang_rule(chess, x, y)
        elif square == 6:
            ret = self.__pao_rule(chess, x, y)
        elif square == 7:
            ret = self.__bing_rule(chess, x, y)

        return ret
    
    def is_friend(self, chess1:int, chess2:int)->bool:
        """判断两个棋子是否是友方

        Args:
            chess1 (int): 棋子1
            chess2 (int): 棋子2

        Returns:
            bool: 是友方则返回True，否则False
        """
        return (chess1-10)*(chess2-10)>0


    def in_territory(self, x:int, y:int, red=False)->bool:
        """检查指定坐标是否在领地内

        Args:
            x (int): x坐标
            y (int): y坐标
            red (bool): 是否是红方领地，默认不是红方（即蓝方）

        Returns:
            bool: 是则返回True，否则False
        """
        try:
            self.get_chess(x, y)
        except:
            return False
        
        s = red if self.isred else not red
        return s and y>4 or not s and y<5

    def in_palace(self, x:int, y:int, red=None)->bool:
        """判断坐标是否在宫内

        Args:
            x (int): x坐标
            y (int): y坐标
            red (bool|None): 是否是红方的宫，为None时判断是否在宫内而不管是哪一方的宫

        Returns:
            bool: 在宫内则返回True，否则False
        """
        if red is None:
            return x>2 and x<6 and (y>=0 and y<=2 or y>=7 and y<=9)
        else:
            s = red if self.isred else not red
            return x>2 and x<6 and (s and y>=7 and y<=9 or not s and y>=0 and y<=2)

    def get_chess(self, x:int, y:int)->int:
        """获得当前棋盘上的棋子

        Args:
            x (int): 棋子x坐标
            y (int): 棋子y坐标

        Raises:
            IndexError: 当x， y坐标超出棋盘范围时会引发该异常

        Returns:
            int: 棋子
        """
        if x<0 or y<0:
            raise IndexError(f"棋子坐标{(x, y)}越界!")
        try:
            chess = self.__board_map[y][x]
        except:
            raise IndexError(f"棋子坐标{(x, y)}越界!")
        return chess

    def __che_rule(self, chess:int, x:int, y:int)->List[Tuple[int, int]]:
        """棋子车的着棋规则

        Args:
            chess (int): 棋子
            x (int): x坐标
            y (int): y坐标

        Returns:
            List[Tuple[int, int]]: 棋子可行的着子点列表
        """
        ret = []
        direct_map = [[0, -1], [0, 1], [-1, 0], [1, 0]]
        for dx, dy in direct_map:
            for i in range(1, 10):
                tx = x+dx*i
                ty = y+dy*i
                try:
                    tmp = self.get_chess(tx, ty)
                except:
                    break
                if tmp == 0:
                    ret.append([tx, ty])
                elif not self.is_friend(chess, tmp):
                    ret.append([tx, ty])
                else:
                    break

        return ret

    def __ma_rule(self, chess:int, x:int, y:int)->List[Tuple[int, int]]:
        ret = []
        direct_map = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]]
        for dx, dy in direct_map:
            tx = x + dx
            ty = y + dy
            try:
                tmp = self.get_chess(tx, ty)
                if tmp == 0 or not self.is_friend(chess, tmp):
                    # 检查是否别马腿
                    dx = (dx//abs(dx))*(abs(dx)-1)
                    dy = (dy//abs(dy))*(abs(dy)-1)
                    mx = x+dx
                    my = y+dy
                    tmp = self.get_chess(mx, my)
                    if tmp == 0:
                        ret.append([tx, ty])
            except:
                pass

        return ret

    def __xiang_rule(self, chess:int, x:int, y:int)->List[Tuple[int, int]]:
        ret = []
        direct_map = [[2, 2], [-2, 2], [2, -2], [-2, -2]]
        for dx, dy in direct_map:
            tx = x + dx
            ty = y + dy
            try:
                tmp = self.get_chess(tx, ty)
                if tmp == 0 or not self.is_friend(chess, tmp):
                    # 检查是否过河, 象不能过河
                    if not self.in_territory(tx, ty):
                        continue

                    # 检查是否别象眼
                    dx = (dx//abs(dx))*(abs(dx)-1)
                    dy = (dy//abs(dy))*(abs(dy)-1)
                    mx = x+dx
                    my = y+dy
                    tmp = self.get_chess(mx, my)
                    if tmp == 0:
                        ret.append([tx, ty])
            except:
                pass

        return ret

    def __shi_rule(self, chess:int, x:int, y:int)->List[Tuple[int, int]]:
        ret = []
        direct_map = [[1, 1], [-1, 1], [1, -1], [-1, -1]]
        for dx, dy in direct_map:
            tx = x + dx
            ty = y + dy
            try:
                tmp = self.get_chess(tx, ty)
                if tmp == 0 or not self.is_friend(chess, tmp):
                    # 检查是否出宫, 士不能出宫
                    if self.in_palace(tx, ty):
                        ret.append([tx, ty])
            except:
                pass

        return ret

    def __jiang_rule(self, chess:int, x:int, y:int)->List[Tuple[int, int]]:
        ret = []
        direct_map = [[1, 0], [-1, 0], [0, -1], [0, 1]]
        for dx, dy in direct_map:
            tx = x + dx
            ty = y + dy
            try:
                tmp = self.get_chess(tx, ty)
                if tmp == 0 or not self.is_friend(chess, tmp):
                    # 检查是否出宫, 士不能出宫
                    if self.in_palace(tx, ty):
                        ret.append([tx, ty])
            except:
                pass

        return ret

    def __pao_rule(self, chess:int, x:int, y:int)->List[Tuple[int, int]]:
        ret = []
        direct_map = [[0, -1], [0, 1], [-1, 0], [1, 0]]
        for dx, dy in direct_map:
            for i in range(1, 10):
                tx = x+dx*i
                ty = y+dy*i
                try:
                    tmp = self.get_chess(tx, ty)
                    if tmp == 0:
                        ret.append([tx, ty])
                    else:
                        # 判断炮是否可以打子
                        for j in range(1, 10):
                            mx = tx+dx*j
                            my = ty+dy*j
                            tmp = self.get_chess(mx, my)
                            if tmp == 0:
                                continue
                            elif not self.is_friend(chess, tmp):
                                ret.append([mx, my])
                            break
                        break
                except:
                    break
                
        return ret

    def __bing_rule(self, chess:int, x:int, y:int)->List[Tuple[int, int]]:
        ret = []
        direct_map = []
        s = (chess-10)//abs(chess-10) # 红棋为-1，蓝棋为+1
        s = s if self.isred else -s # 兵的行进方向
        direct_map.append([0, s])
        if not self.in_territory(x, y):
            direct_map.extend([[1, 0], [-1, 0]])

        for dx, dy in direct_map:
            tx = x+dx
            ty = y+dy
            try:
                tmp = self.get_chess(tx, ty)
            except:
                continue
            if tmp == 0 or not self.is_friend(chess, tmp):
                ret.append([tx, ty])
        return ret