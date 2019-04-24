<?php
class MyDB
{
    private $m;
    private $user_table;
    function __construct()
    {
        try
        {
            $this->m = new Mongo();
            $db = $this->m->selectDB('huhushuidb');
            $this->user_table = $db->selectCollection('WechatUser');
        }
        catch(MongoConnectionException $e)
        {
            echo '<p>数据库无法连接，请联系我们的工作人员。</p>';
            exit();
        }
    }

    function __destruct()
    {
            $this->m->close();
    }

    public function updateUserInfo($openid, $userInfo)
    {
        return $this->user_table->update(
            array('openid' => $openid),
            array('$set' => array(
                'subscribe' => $userInfo['subscribe'],
                'nickname' => $userInfo['nickname'],
                'sex' => $userInfo['sex'],
                'city' => $userInfo['city'],
                'province' => $userInfo['province'],
                'country' => $userInfo['country'],
                'language' => $userInfo['language'],
                'headimgurl' => $userInfo['headimgurl'],
                'subscribe_time' => $userInfo['subscribe_time'],
                'unionid' => isset($userInfo['unionid'])?$userInfo['unionid']:0)),
            array('upsert' => True));
    }

    public function updateUserLocation($openid, $eventGeo)
    {
        return $this->user_table->update(
            array('openid' => $openid),
            array('$set' => array(
                'latitude' => floatval($eventGeo['x']),
                'longitude' => floatval($eventGeo['y']))),
            array('upsert' => True));
    }
} 
