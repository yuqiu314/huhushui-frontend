<?php
include "EasyWechat.class.php";
include "../../private/wechat.config.php";
include 'mydb.class.php';

const MSG_SUBSCRIBE_SUCCESS = '您好！恭喜，您已经可以开始订房了！';
const MSG_SUBSCRIBE_FAILED = '获取基本信息失败，请回复“同意”或者“注册”进行注册以后再订房。';
const MSG_REG_SUCCESS = '您好！注册已经成功，您可以开始订房了！';
const MSG_REG_FAILED = '非常抱歉，注册依然有些问题，请重试，或者拨打客服热线：4007-020-021';
const MSG_DEFAULT = '请点击按钮订房！如果有任何问题，欢迎拨打客服热线：4007-020-021';

$weObj = new EasyWechat($options);
$weObj->valid();
$type = $weObj->getRev()->getRevType();
$revFrom = $weObj->getRev()->getRevFrom();
switch($type) {
    case Wechat::MSGTYPE_EVENT:
        $revEvent = $weObj->getRev()->getRevEvent();
        $eventType = $revEvent['event'];
        switch($eventType) {
        case Wechat::EVENT_SUBSCRIBE:
            $userInfo = $weObj->getUserInfo($revFrom);
            //补丁
            for ($x=0; $x<3; $x++) {
                if(!$userInfo)
                {
                    $weObj->resetAuth();
                    $userInfo = $weObj->getUserInfo($revFrom);
                }
            }
            $db = new MyDB();
            if($userInfo && $db->updateUserInfo($revFrom, $userInfo))
            {
                $weObj->text($userInfo['nickname'].MSG_SUBSCRIBE_SUCCESS)->reply();
            }
            else
            {
                $weObj->text(MSG_SUBSCRIBE_FAILED)->reply();
            }
            exit;
            break;
        case Wechat::EVENT_LOCATION:
            $eventGeo = $weObj->getRev()->getRevEventGeo();
            //这里可以用来更新地址，但是不能保证此时用户信息一定是存在的
            $db = new MyDB();
            $db->updateUserLocation($revFrom, $eventGeo);
            //$weObj->text($revFrom."地址来了：x=".$eventGeo['x'].",y=".$eventGeo['y'])->reply();
            exit;
            break;
        default:
            exit;
        }
        exit;
        break;
    case Wechat::MSGTYPE_TEXT:
        $revContent = $weObj->getRev()->getRevContent();
        if($revContent == '注册' || $revContent == '同意' || $revContent == 'ok')
        {
            $userInfo = $weObj->getUserInfo($revFrom);
            //补丁
            for ($x=0; $x<3; $x++) {
                if(!$userInfo)
                {
                    $weObj->resetAuth();
                    $userInfo = $weObj->getUserInfo($revFrom);
                }
            }
            $db = new MyDB();
            if($userInfo && $db->updateUserInfo($revFrom, $userInfo))
            {
                $weObj->text($userInfo['nickname'].MSG_REG_SUCCESS)->reply();
            }
            else
            {
                $weObj->text(MSG_REG_FAILED)->reply();
            }
        }
        else
        {
            $weObj->text(MSG_DEFAULT)->reply();
        }
        exit;
        break;
    default:
        $weObj->text($revFrom.MSG_DEFAULT)->reply();
        exit;
        break;
}
