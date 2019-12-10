import datetime

# 日付情報を取得する関数
def getDayInfomation():
    time_info=datetime.datetime.today()
    day_info="{0}_{1}_{2}_{3}_{4}_{5}".format(time_info.year,time_info.month,time_info.day,time_info.hour,time_info.minute,time_info.second)
    return day_info
