/*====================常量定义====================*/

const packageDT = "com.alibaba.android.rimet";
const corpId = "xxxxxxxxxxx";
const clockInIndex = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html";
const loginActivity = "com.alibaba.android.user.login.SignUpWithPwdActivity";
const dateApiUrl = "https://api.apihubs.cn/holiday/get?cn=1&date=";
const minNum = xxx;
const maxNum = xxx;
const phoneNo = "xxxxxxxxxxx";
const passWd = "xxxxxxxxxxx";

/*====================功能函数====================*/

//获取并格式化当前日期
function getNowFormatDay() {
    var nowDate = new Date();
    var day = nowDate.getDate();
    var month = nowDate.getMonth() + 1;
    var year = nowDate.getFullYear();
    var format = year + "" + month + "" + day + "";
    return format;
}

//日期属性判断
function dateDecide() {
    var nowDay = getNowFormatDay();
    var date = nowDay;
    var res = http.get(dateApiUrl + date);
    var isHoliday = res.body.json()["data"]["list"][0]["workday_cn"];
    var apiStatus = res.body.json()["code"];
    var apiMag = res.body.json()["msg"];
    if(apiStatus !== 0) {
        toastLog("请求失败: " + apiMag);
    } else {
        return isHoliday;
    }
}

//随机延迟计时器
function randomSleep() {
    var randNum = random(minNum, maxNum);
    toastLog("随机延迟" + randNum + "分钟");
    sleep(randNum * 60 * 1000);
    toastLog("随机延迟结束尝试打卡");
    sleep(1000);
}

//应用启动器
function startDing() {
    toastLog("正在启动钉钉");
    var launch = app.launch(packageDT);
    if(launch) {
        sleep(5000);
    } else {
        toastLog("钉钉启动失败");
        exit();
    }
}

//登录模拟器
function signIn() {
    if(currentActivity() === loginActivity) {
        toastLog("账号状态未登录");
        id("et_phone_input").findOne().setText(phoneNo);
        toastLog("输入账号完成");
        id("et_password").findOne().setText(passWd);
        toastLog("输入密码完成");
        id("cb_privacy").findOne().click();
        toastLog("已同意隐私协议");
        id("btn_next").findOne().click();
        toastLog("正在登陆...");
        sleep(3000);
    }
    if(currentActivity() !== loginActivity) {
        toastLog("账号状态已登录");
        sleep(1000);
    }
}

//考勤页定位器
function attendPage() {
    var url_scheme = clockInIndex + "?corpId=" + corpId;
    var clockIn = app.intent({
        action: "VIEW",
        data: url_scheme
    });
    app.startActivity(clockIn);
    toastLog("正在进入考勤页");
}

//打卡动作捕捉器
function doClockBut(){
    var clockInBut = text("上班打卡").visibleToUser(true).findOne(1000);
    if(clockInBut !== null) {
        toastLog("准备上班卡");
        sleep(1000);
        clockInBut.click();
    }
    var clockOutBut = text("下班打卡").visibleToUser(true).findOne(1000);
    if(clockOutBut !== null) {
        toastLog("准备打下班卡");
        sleep(1000);
        clockOutBut.click();
    }
}

/*====================任务开始====================*/

//检查无障碍权限
auto.waitFor("normal");

//点亮屏幕15分钟
if(!device.isScreenOn()) {
    device.wakeUp();
}
device.keepScreenOn(900 * 1000);

//上滑解锁屏幕
swipe(500, 2000, 500, 1000, 220);
sleep(1000);
home();

//非工作日直接退出
if(dateDecide() !== "工作日") {
    toastLog("今天不用上班啦");
    sleep(1000);
    exit();
}

//启动钉钉
startDing();

//自动登录
signIn();

//进入考勤页
attendPage();

//拟人化
randomSleep();

//打卡点击动作
doClockBut();

//打卡后返回桌面
toastLog("结束钉钉任务");
sleep(1000);
id("close_layout").findOne(1000).click();
sleep(1000);
home();
sleep(1000);

//熄灯节能退出
device.cancelKeepingAwake();
exit();
