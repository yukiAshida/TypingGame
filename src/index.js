import React, {Component} from "react";
import ReactDOM from "react-dom";
import request from "superagent";
import './style.css'
import r2h from './romanToHiragana'

import ButtonComponent from './component/button'
import {TextComponent,TextComponentReadOnly} from './component/text'
import SelectComponent from './component/select';
import CheckboxComponent from './component/checkbox'


import Switch from '@material-ui/core/Switch';
import Card from '@material-ui/core/Card'
import Grid from '@material-ui/core/Grid'

import sound_base64 from './beep.js'

const SPLIT = 5;
const options = ["","a","i","u","e","o","ha","hi","hu","he","ho","ya","yi","yu","ye","yo","su","tu","tsu","n"];

var KATAKANA = /[\u{3000}-\u{301C}\u{30A1}-\u{30F6}\u{30FB}-\u{30FE}]/mu;


class Main extends Component{

    constructor(props){
        super(props);
        this.state = {
            
            "question":{"real":[], "view":[]},
            "input":{"real":"", "view":[]},
            "attention":0,
            
            "phase": 0, // 0=start, 1=task, 2=end, 3=settings
            
            "end": false, // 課題をすべて終えたかどうか
            "set_no": 0, //何番目の課題か
            "Ts": null, // タスク開始時間
            "color": "#AAEEEE",
            "practice": false,
            "last_saved": false,
            
            "grades":{
                "error": 0, //各問題の間違えた回数
                "typing": 0, // タイピング数
                "time":0,
            },
            
            
            "settings":{
                "id":"",
                "timelimitcheck":false,
                "timelimit":null,
                "task":null,
                "order":null,
                "order_view":""
            }
        };
    }


    // %%%%%%%%%%%%% クリックコールバック関数 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 

    // タスク開始のボタンプッシュに対するコールバック関数
    onClickStart(practice){
        

        this.setQuestion();

        var new_state = Object.assign({},this.state);
        new_state["phase"] = 1;
        
        if(practice){
            new_state["practice"] = true;
        }

        var today = new Date();
        new_state["Ts"] = today.getTime();
        
        this.setState(new_state);

        // 制限時間がある場合は設定
        if(this.state["settings"]["timelimitcheck"]){
            timeCounter(this.state["settings"]["timelimit"], ()=>this.timeUp() );    
        }

        
    }  

    onClickSettings(){
        var new_state = Object.assign({},this.state);
        new_state["phase"] = 3;
        this.setState(new_state);
    }

    // タスク終了画面のボタンプッシュに対するコールバック関数
    onClickEnd(){

        var new_state = Object.assign({},this.state);

        if(this.state["practice"]){

            // === 元reset関数 ========================
            new_state["grades"]["error"] = 0;
            new_state["grades"]["typing"] = 0;
            new_state["input"]["real"] = "";
            new_state["attention"] = 0;
            // ===========================
            
            new_state["phase"] = 0
            new_state["practice"] = false;
            alert("以上で練習は終了です。\n本番よろしくお願いします。")

        }else{

            if(this.state["last_saved"]==false){
                this.save();
            }

            new_state["phase"] = this.state["end"]?2:0;

            // === 元 nextTask関数 ====================
            new_state["set_no"] += 1;
            new_state["grades"]["error"] = 0;
            new_state["grades"]["typing"] = 0;
            new_state["input"]["real"] = "";
            new_state["attention"] = 0;
            // =====================================

            if(this.state["end"]){
                alert("終了です。\nありがとうございました");
                new_state["last_saved"] = true;
            }
        }

        this.setState(new_state);
    }

    // セッティング画面のボタンプッシュに対するコールバック関数
    onClickSettingsOk(){

        var new_state = Object.assign({},this.state);
        new_state["phase"] = 0;
        this.setState(new_state);
    }




    // タスク開始のボタンプッシュからTIMELIMIT秒後に呼ばれる関数（タスクの終了合図）
    timeUp(){
        var new_state = Object.assign({},this.state);
        new_state["phase"] = 2;
        new_state["grades"]["time"] = this.state["settings"]["timelimit"];
        this.setState(new_state);
    }

    // %%%%%%%%%%%%% キーコードコールバック関数 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    
    // キーコード取得（Reactっぽくはないが）
    UNSAFE_componentWillMount() {
        document.addEventListener("keydown", (e)=>this.keyCode(e));
    }

    // キータイピングで呼ばれる関数
    keyCode(e){

        // タスク中じゃないなら不要
        if(this.state["phase"]!=1){
            return 0;
        }
        
        var new_state = Object.assign({},this.state);
        
        var attention = this.state["attention"] // 現在の注目箇所
        var pressed = e.key // 入力された値

        if(pressed == "," && this.state["question"]["real"][attention]=="、"){

            new_state["input"]["view"][attention] = "、"
            new_state["input"]["real"] = ""
            new_state["attention"] += 1
            
        }else if(pressed == "." && new_state["question"]["real"][attention]=="。"){
            
            new_state["input"]["view"][attention] = "。"
            new_state["input"]["real"] = ""
            new_state["attention"] += 1
        
        }else if(pressed == parseFloat(pressed) && this.state["question"]["real"][attention] == pressed){

            new_state["input"]["view"][attention] = pressed;
            new_state["input"]["real"] = "";
            new_state["attention"] += 1;
        
        }else{

            // 入力情報を更新
            var input = this.state["input"]["real"] + pressed;
            
            // 通過フラグ
            var pass_flag = false;
            
            for (let op of options){
                
                let converted = r2h(input+op)

                if (this.state["question"]["real"][attention].startsWith( converted )){
                    pass_flag = true;
                    break;
                }

            }

            for (let op of ["a","i","u","e","o"].map(x=>pressed+x)){
                
                let converted = r2h(input+op)

                if (this.state["question"]["real"][attention].startsWith( converted )){
                    pass_flag = true;
                    break;
                }

            }

            // 通過した場合
            if(pass_flag){

                // 完全一致の場合
                if(this.state["question"]["real"][attention] == r2h(input)){

                    new_state["input"]["real"] = "";
                    new_state["input"]["view"][attention] = this.state["question"]["view"][attention];
                    new_state["attention"] += 1;
                }else{

                    new_state["input"]["real"] = input;
                    new_state["input"]["view"][attention] = input;
                }

            // 通過できなかった場合
            }else{

                // 画面の色を一瞬赤くする
                new_state["color"] = "#FFAAAA";
                new_state["grades"]["error"] += 1;

                // datauri scheme 形式にして Audio オブジェクトを生成します
                var sound = new Audio("data:audio/wav;base64," + sound_base64);
                sound.play();

                // 0.1秒後に画面の色を戻す
                setTimeout(()=>this.originalColor(),100);
            }
        }

        new_state["grades"]["typing"] +=1
        
        if( new_state["attention"] == this.state["question"]["real"].length ){
            var today = new Date();
            new_state["grades"]["time"] = (today.getTime() - this.state["Ts"])/1000;
            new_state["phase"] = 2;
        }

        this.setState(new_state);

    }

    // 背景色を元に戻す
    originalColor(){
        var new_state = Object.assign({},this.state);
        new_state["color"] = "#aaeeee";
        this.setState(new_state);
    }
    
    // %%%%%%%%%%%%% 問題設定非同期関数 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    setQuestion(){


        request.post('/set_question')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(this.state)
        .end(
            (error, res) => {

                // サーバーからのレスポンスを取得
                var info = JSON.parse(res.text);
                
                // 状態を更新
                var new_state = Object.assign({},this.state);
                new_state["question"]["real"] = info["real"];
                new_state["question"]["view"] = info["view"];
                new_state["input"]["view"] = (new Array(info["real"].length)).fill('');
                
                new_state["end"] = (this.state["settings"]["task"]==this.state["set_no"]+1)

                this.setState(new_state);
                
            }
        );
    }

    // %%%%%%%%%%%%% 保存＆リセット関数 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    save(){

        request.post('/save')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(this.state)
        .end(
            (error, res) => {
                //this.nextTask();
            }
        );
    }

    nextTask(){
        var new_state = Object.assign({},this.state);
        
        new_state["set_no"] += 1;
        new_state["grades"]["error"] = 0;
        new_state["grades"]["typing"] = 0;
        new_state["input"]["real"] = "";
        new_state["attention"] = 0;
        
        this.setState(new_state);
        
    }

    reset(){

        var new_state = Object.assign({},this.state);
        
        new_state["grades"]["error"] = 0;
        new_state["grades"]["typing"] = 0;
        new_state["input"]["real"] = "";
        new_state["attention"] = 0;
        
        this.setState(new_state);
    }

    // %%%%%%%%%%%%%%% 設定変更に対するコールバック関数 %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 

    onChange(setting, e){
        var new_state = Object.assign({},this.state);

        if(setting=="order_view"){
            var order_dict = {
                "正順（0からq[task].txtまで順番に出題）":0,
                "ランダム（0からq[task].txtまでランダムに出題）":1,
                "スーパーランダム（存在する全てのテキストからランダムに出題）":2
            }

            new_state["settings"]["order"] = order_dict[e.target.value]; 
        }
        
        new_state["settings"][setting] = e.target.value;
        
        this.setState(new_state);
    }    

    onChangeState(setting, e){

        var new_state = Object.assign({},this.state);
        new_state["settings"][setting] = new_state["settings"][setting]?false:true;
        this.setState(new_state);
    }

    render(){
        
        document.getElementsByTagName("body")[0].style.backgroundColor = this.state["color"];
        

        // 描画
        return(

            <div id="main">
                { this.state["phase"]==0 && <Start 
                                        onClickStart={()=>this.onClickStart(false)} 
                                        onClickSettings={()=>this.onClickSettings()} 
                                        onClickPractice={()=>this.onClickStart(true)}
                                        setNo = {this.state["set_no"]}
                                        settings={this.state["settings"]} 
                                    />}
                { this.state["phase"]==1 && <Task 
                                        question={this.state["question"]["view"]} 
                                        input={this.state["input"]["view"]}
                                    />}
                { this.state["phase"]==2 && <End 
                                        onClick={()=>this.onClickEnd()} 
                                        endState={this.state["end"]}
                                    />}
                { this.state["phase"]==3 && <Settings 
                                        onClick={()=>this.onClickSettingsOk()} 
                                        onChangeId={(e)=>this.onChange("id",e)}
                                        onChangeTimelimit={(e)=>this.onChange("timelimit",e)}
                                        onChangeTask = {(e)=>this.onChange("task",e)}
                                        onChangeTimelimitCheck={(e)=>this.onChangeState("timelimitcheck",e)}
                                        onChangeOrder = {(e)=>{this.onChange("order_view",e)}}
                                        valueId={this.state["settings"]["id"]}
                                        valueTimelimit={this.state["settings"]["timelimit"]}
                                        valueTask = {this.state["settings"]["task"]}
                                        valueOrder = {this.state["settings"]["order_view"]}
                                        checkedTimelimit={this.state["settings"]["timelimitcheck"]}          
                                    />}
            </div>
            
        );
    }
}

// タスク開始画面
const Start = (props)=>{

    return(
        <div id="start">
            <Card className='card'>
                
                <Grid container>
                    <Grid item xs={7}><div className="message">よろしくお願いします</div></Grid>
                    <Grid item xs={1}><div/></Grid>
                    <Grid item xs={3}><ButtonComponent onClick={props.onClickPractice} value={"練習"}/></Grid>
                </Grid>  

                {
                    props.setNo==0 && 
                    <Grid container>
                        <Grid item xs={5}><ButtonComponent onClick={props.onClickSettings} value={"実験設定"}/></Grid>
                        <Grid item xs={1}><div/></Grid>
                        <Grid item xs={5}><ButtonComponent onClick={props.onClickStart} value={"スタート"}/></Grid>
                    </Grid>    
                }
                
                {
                    props.setNo!=0 && 
                    <Grid container>
                        <Grid item xs={5}><ButtonComponent onClick={props.onClickStart} value={"スタート"}/></Grid>
                    </Grid>    
                }

            </Card>

            <Card className='card'>
                <div id="start_setting">

                    <Grid container>
                        <Grid item xs={2}><div>被験者ID : </div></Grid>
                        <Grid item xs={9}><div>{props.settings["id"]==""?"未指定":props.settings["id"]}</div></Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={2}><div>時間制限 : </div></Grid>
                        <Grid item xs={9}><div>{props.settings["timelimitcheck"]?props.settings["timelimit"]+" [s]":"時間制限なし"}</div></Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={2}><div>総課題数 : </div></Grid>
                        <Grid item xs={9}><div>{props.settings["task"]==null?"未指定":props.settings["task"]}</div></Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={2}><div>出題順序 : </div></Grid>
                        <Grid item xs={9}><div>{props.settings["order_view"]==""?"未指定":props.settings["order_view"]}</div></Grid>
                    </Grid>

                    <Grid container>
                        <Grid item xs={2}><div>次の課題 : </div></Grid>
                        <Grid item xs={9}><div>{props.setNo + 1}</div></Grid>
                    </Grid>

                </div>
            </Card>
        </div>
    );
}

// タスク画面
const Task = (props)=>{

    return(
        <div id="task" >

            <div className="task-content">
                <div className="label">問題： </div>
                <p className="content">{props.question.join("")}</p>            
            </div>

            <div className="task-content">
                <div className="label">解答： </div>
                <p className="content">{props.input.join("")}</p>
            </div>

        </div>
    );
}

// タスク終了画面
const End = (props)=>{

    return(

        <div id="end">
                        
            <Card className={"card"}>
                <Grid container>
                    <Grid item xs={1}></Grid>
                    <Grid item xs={9}>
                            <div className={"message"}>お疲れ様です</div>
                            <div className={"message"}>アンケートにお答えください</div>
                            <ButtonComponent onClick={props.onClick} value={props.endState?"終了":"次の課題へ"}/>
                    </Grid>
                    <Grid item xs={1}></Grid>
                </Grid>
            </Card>
        
        </div>
    );
}

const Settings = (props)=>{

    return(
        <div id="settings">

            <Card className='card'>    
                <div className="setting_group">
                    <h1>被験者IDを指定してください</h1>
                    <TextComponent label = "ID" value={props.valueId} onChange={props.onChangeId} />
                </div>
            </Card>

            <Card className='card'>
                <div className="setting_group">
                    <h1>制限時間を指定してください</h1>
                    <Switch checked={props.checkedTimelimit} onChange={props.onChangeTimelimitCheck} value="timelimit" />
                    {props.checkedTimelimit && <TextComponent label="時間制限 [s]" value={props.valueTimelimit} onChange={props.onChangeTimelimit}/>}
                </div>
            </Card>
            
            <Card className='card'>
                <div className="setting_group">
                    <h1>課題数を指定してください</h1>
                    <TextComponent label = "課題数" value={props.valueTask} onChange={props.onChangeTask} />
                </div>
            </Card>

            <Card className='card'>
                <div className="setting_group">
                    <h1>出題順を指定してください</h1>
                    <SelectComponent label={"出題順"} value={props.valueOrder} change={props.onChangeOrder} items={["正順（0からq[task].txtまで順番に出題）","ランダム（0からq[task].txtまでランダムに出題）","スーパーランダム（存在する全てのテキストからランダムに出題）"]}/>
                </div>
            </Card>

            <Card className='card'>
                <ButtonComponent value = "OK" onClick={props.onClick}/>        
            </Card>  
        </div>
    );
}

// 非同期で一定時間後に適当な関数を呼び出す関数
const timeCounter = (waitSeconds, someFunction) => {

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(someFunction())
        }, waitSeconds * 1000)
    })  
}

function kanaToHira(str) {
    return str.replace(/[\u30a1-\u30f6]/g, function(match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}




ReactDOM.render(
    <Main />,
    document.getElementById('root')
);