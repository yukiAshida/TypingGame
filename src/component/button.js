import React, {Component} from "react";
import ReactDOM from "react-dom";
import Button from '@material-ui/core/Button';

// ボタンコンポーネント
const ButtonComponent = (props)=>{
    return (
        <Button 
            type="button"
            size='medium'
            variant='contained' 
            color='primary' 
            style={{fontSize:"30px", maxWidth: '100%', maxHeight: '60px', minWidth: '100%', minHeight: '60px', fontFamily:'-apple-system, BlinkMacSystemFont, "Helvetica Neue", YuGothic, "ヒラギノ角ゴ ProN W3", Hiragino Kaku Gothic ProN, Arial, "メイリオ", Meiryo, sans-serif'}} 
            onClick={props.onClick}>
            {props.value}
        </Button>
    );
}

export default ButtonComponent;