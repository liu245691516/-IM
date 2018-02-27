var username = getCookie('username');
var userData = {
	jid: username + '@imsvrdell1/web',
	password: "123456"
};
var robotName = '57b9cdfbafb42a79ef2c2afa8875bb9f';
var mySrc = getMySrc(); //图片地址的处理
var friendArr = []; //用来存储好友关系
var groupArr = []; //用来存储聊天室
var groupChatArr = []; //用于存储群聊
//表情的引入
var faceChat = new smohanfacebox({
	obj: $("i.faceBtns"), //参数
	Event: "click", //触发事件	
	divid: "allFace", //外层DIV ID
});
var objArr = [];
var num = 0;
var count = 0;
var serverCode = [15737921002, 18515084412, 15065523229, 18222957029];
var Gab = {
	connection: null,
	connectXMPP: function() {
		var conn = new Strophe.Connection(
			'http://ww.quanzinet.com/http-bind');
		conn.connect(userData.jid, userData.password, function(status) {
			console.log(status, Strophe.Status.CONNECTED, Strophe.Status.DISCONNECTED)
			if (status === Strophe.Status.CONNECTED) {
				$(document).trigger('connected');
			} else if (status === Strophe.Status.DISCONNECTED) {
				$(document).trigger('disconnected');
			}
		});
		console.log(conn)
		Gab.connection = conn;
	},
	//得到聊天框的位置
	getChatBoxPosition: function() {
		var t = ($(window).height() - 590) / 2;
		var l = ($(window).width() - 800) / 2;
		// if ($('.rightTop').attr('data-type') == '') {
		// 	$('.menu').hide();
		// }
		if ($('.chatWrap').attr('data-off') == 0) {
			$('.chatWrap').show().css({
				'left': l,
				'top': t
			}).attr('data-off', 1);
		} else {
			$('.chatWrap').show();
		}
	},
	// 进度条控制到底部
	getBottom: function() {
		// niceScroll($('.chatMessage'),$(".message"));
		var h = $('.message').outerHeight();
		var _h = h - 374;
		if (h >= 374) {
			$('.chatMessage').scrollTop(_h);
		}
	},
	getMessageCount: function() {
		var topLen = $('.topMsg_count').length;
		var num = 0;
		for (var j = 0; j < topLen; j++) {
			var a = $('.topMsg_count').eq(j).text() * 1;
			num += a;
		}
		// console.log(num)
		if (num == 0) {
			$('.messageCount').hide();
		} else {
			$('.messageCount').text(num);
			$('.messageCount').show();
		}
	},
	usersroster: function() {
		$.ajax({
			type: "get",
			url: RestfulHOST() + '/users/roster?username=' + username,
			dataType: "json",
			headers: {
				"Authorization": "AQAa5HjfUNgCr27x",
				"Accept": "application/json"
			},
			success: function(msg) {
				console.log(msg)
				if (msg.status == 0) {
					var number = 0;
					var s = "";
					var str = "";
					for (var i = 0; i < msg.rosterItem.length; i++) {
						var mssg = msg.rosterItem[i];
						if (mssg.subscriptionType != 0 && mssg.subscriptionType != 4) {
							var dName = mssg.username;
							var myindustry = mssg.myindustry;
							var nikename = '';
							friendArr.push(dName);
							number = number + 1;
							str += '<li class="Chat_list" data-off="0" data-magicno="' + mssg.magicno + '" data-oldname="' + dName + '" data-name="' + $.md5(dName) + '" data-myindustry="';
							s += '<li class="Chat_list" data-off="0" data-magicno="' + mssg.magicno + '" data-oldname="' + dName + '" data-name="' + $.md5(dName) + '" data-myindustry="';
							if (myindustry == null) {
								myindustry = '';
							}
							str += myindustry + '">' + '<dl>';
							s += myindustry + '">' + '<dl>';
							if (mssg.avatarfile == "") {
								str += '<dt><img class="img" src="/img/first.png"></dt>';
								s += '<dt><img class="img" src="/img/first.png"></dt>';
							} else {
								str += '<dt><img class="img" src="' + ImgHOST() + mssg.avatarfile + '"></dt>';
								s += '<dt><img class="img" src="' + ImgHOST() + mssg.avatarfile + '"></dt>';
							}

							if ((mssg.markname == "" || mssg.markname == undefined) && (mssg.nickname == null || mssg.nickname == '' || mssg.nickname == 'null')) {
								var pattern = /^1[34578]\d{9}$/;
								if (pattern.test(dName) == true) {
									dName = dName.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'); //屏蔽手机号中间四位
								}
								str += '<dd class="nickname">' + dName + '</dd>';
								s += '<dd class="nickname">' + dName + '</dd>';
							} else {
								if (mssg.markname != undefined && mssg.markname != '' && mssg.markname != 'null' && mssg.markname != null) {
									str += '<dd class="nickname">' + mssg.markname + '</dd>';
									s += '<dd class="nickname">' + mssg.markname + '</dd>';
								} else {
									str += '<dd class="nickname">' + mssg.nickname + '</dd>';
									s += '<dd class="nickname">' + mssg.nickname + '</dd>';
								}
							}
							s += '</dl></li>';
							str += '</dl>' +
								'<div class="time">' + formatTime(mssg.lastlogintime).substring(0, 10) + '</div>' +
								'</li>';

						}
						$(".CommunicationsGroup .friends .theme span").html(number)
					}
					$(".AddressBook .friends ul").html(str);
					$(".recmdList .CommunicationsGroup .friends ul").html(s);
				}
			},
			error: function() {
				console.log("error")
			}

		});
	},
	jid_to_id: function(jid) {
		return Strophe.getBareJidFromJid(jid)
			.replace(/@/g, "-")
			.replace(/\./g, "-");
	},
	on_roster: function(iq) {
		$(iq).find('item').each(function() {
			var jid = $(this).attr('jid');
			var name = $(this).attr('name') || jid;

			// transform jid into an id
			var jid_id = Gab.jid_to_id(jid);
			var contact = $("<li id='" + jid_id + "'>" +
				"<div class='roster-contact offline'>" +
				"<div class='roster-name'>" +
				name +
				"</div><div class='roster-jid'>" +
				jid +
				"</div></div></li>");

			Gab.insert_contact(contact);
		});

		// set up presence handler and send initial presence
		Gab.connection.addHandler(Gab.on_presence, null, "presence");
		Gab.connection.send($pres());
	},
	pending_subscriber: null,
	on_message: function(message) {
		console.log(message);
		var full_jid = $(message).attr('from');
		var jid = Strophe.getBareJidFromJid(full_jid);
		var jid_id = Gab.jid_to_id(jid);
		console.log(111)
		if ($('#chat-' + jid_id).length === 0) {
			$('#chat-area').tabs('add', '#chat-' + jid_id, jid);
			$('#chat-' + jid_id).append(
				"<div class='chat-messages'></div>" +
				"<input type='text' class='chat-input'>");
		}

		$('#chat-' + jid_id).data('jid', full_jid);

		$('#chat-area').tabs('select', '#chat-' + jid_id);
		$('#chat-' + jid_id + ' input').focus();

		var composing = $(message).find('composing');
		if (composing.length > 0) {
			$('#chat-' + jid_id + ' .chat-messages').append(
				"<div class='chat-event'>" +
				Strophe.getNodeFromJid(jid) +
				" is typing...</div>");

			Gab.scroll_chat(jid_id);
		}

		var body = $(message).find("html > body");

		if (body.length === 0) {
			body = $(message).find('body');
			if (body.length > 0) {
				body = body.text()
			} else {
				body = null;
			}
		} else {
			body = body.contents();

			var span = $("<span></span>");
			body.each(function() {
				if (document.importNode) {
					$(document.importNode(this, true)).appendTo(span);
				} else {
					// IE workaround
					span.append(this.xml);
				}
			});

			body = span;
		}
		if (body) {
			// remove notifications since user is now active
			$('#chat-' + jid_id + ' .chat-event').remove();

			// add the new message
			$('#chat-' + jid_id + ' .chat-messages').append(
				"<div class='chat-message'>" +
				"&lt;<span class='chat-name'>" +
				Strophe.getNodeFromJid(jid) +
				"</span>&gt;<span class='chat-text'>" +
				"</span></div>");

			$('#chat-' + jid_id + ' .chat-message:last .chat-text')
				.append(body);

			Gab.scroll_chat(jid_id);
		}

		return true;
	}
}
$(function() {
	Gab.usersroster();
	Gab.connectXMPP();
})



$(document).bind('connected', function() {
	var iq = $iq({
		type: 'get'
	}).c('query', {
		xmlns: 'jabber:iq:roster'
	});
	Gab.connection.sendIQ(iq, Gab.on_roster);
	Gab.connection.addHandler(Gab.on_message,
		null, "message", "chat");
		console.log(Gab.on_message)
});

$(document).bind('disconnected', function() {
	Gab.connection = null;
	Gab.pending_subscriber = null;

	$('#roster-area ul').empty();
	$('#chat-area ul').empty();
	$('#chat-area div').remove();

	$('#login_dialog').dialog('open');
});
$(document).on('click', '.sendBtn', function(ev) {
	var msgs = $('#textBox').val();
	var $right = $('.rightTop');
	var vname = $right.attr('data-name');
	var oldName = $right.attr('data-oldname'); //发送到的那个人的原始用户名
	var toNikeName = $right.find('.userNickname').text();
	var toIndustry = $right.find('.userIndustry').text();
	var toHeadImg = $('.rightTop .topImg img').attr('src');
	var myHeadImg = getCookie("headImgkz");
	var mynikename = getCookie("nickname");
	console.log(oldName)
	var message = $msg({
			to: oldName,
			"type": "chat"
		})
		.c('body').t(msgs).up()
		.c('active', {xmlns: "http://jabber.org/protocol/chatstates"});
	console.log(message);
	Gab.connection.send(message);

});



/*聊天框*/
$(document).on('click', '.friends .Chat_list,.SearchResults .Chat_list', function(ev) {
	var ev = ev || event;
	// memberHidden();
	var t = $(this).attr('data-type');
	if (t == 'groupchat' || t == 'group') {
		$('.menu').show();
	} else {
		$('.menu').hide();
	}
	$('.message').html('');
	$('#image').removeAttr('disabled'); //将文件可点击
	var imgSrc = $(this).find('img').attr('src');
	var type = $(this).find('.nickname').text();
	var _name = $(this).attr('data-name');
	var _oldname = $(this).attr('data-oldname');
	var _myindustry = $(this).attr('data-myindustry');
	var len = $('.msgs_list').length;
	var magicno = $(this).attr('data-magicno');
	var strangename = '';
	var l = $('.AddressBook .friends').find('.Chat_list');
	Gab.getChatBoxPosition();
	if (getURIArgs('strangename')) {
		strangename = getURIArgs('strangename')
	}
	$('.topImg').removeClass().addClass('topImg _userImg');
	$('.topImg').html('<img src="' + imgSrc + '">');
	$('.userNickname').html(type);
	$('.userIndustry').text(_myindustry);
	$('.rightTop').attr({
		'data-type': '',
		'data-naturename': '',
		'data-name': _name,
		'data-oldname': _oldname
	});
	$('body').css('overflow', 'hidden');
	getChatHistory(_name);
	if (_oldname == strangename) {
		$('.like_message').attr('data-off', 1);
	}
	// sendPrivateFile();
	// sendPrivateImg();
	/*判断一下左侧通讯记录里面有没有*/
	if ($(this).attr('data-off') == 0) {
		var msgInfo = '<li class="msgs_list chatActive" data-oldname="' + _oldname + '" data-name="' + _name +
			'" data-myindustry="' + _myindustry + '"><dl><dt class="_userImg"><img src="' + imgSrc + '"><i class="countMsg" style="display:none;">0</i></dt>' +
			'<dd class="user"><span class="username">' + type + '</span><span class="sendTime"></span></dd>' +
			'<dd class="userInfo"></dd><div class="clear"></div></dl></li>';

		var recent = '<li class="Chat_list" data-off="0" data-name="' + _name + '" data-magicno="' + magicno + '" data-myindustry="">' +
			'<dl><dt><img class="img" src="' + imgSrc + '"></dt><dd class="nickname">' + type + '</dd></dl><div class="recmdCircle"></div></li>'
			//陌生人主页的最近联系人通讯录
		$('.groupWrap>ul').prepend(msgInfo);
		$('.recentChat>ul').prepend(recent);
	}
	for (var i = 0; i < l.length; i++) {
		var fName = l.eq(i).attr('data-name');
		if (_name == fName) {
			l.eq(i).attr('data-off', 1); //将通讯录里面的数据开关变成1，让其不能再点
		}
	};
	//点击的时候点哪个匹配哪一个背景色
	for (var j = 0; j < len; j++) {
		var _n = $('.msgs_list').eq(j).attr('data-name');
		if (_name == _n) {
			$('.msgs_list').removeClass('chatActive');
			$('.msgs_list').eq(j).addClass('chatActive');
			$('.msgs_list').eq(j).find(".countMsg").text(0);
			$('.msgs_list').eq(j).find(".countMsg").hide();
		}
	}
	$(this).attr('data-off', 1);
	Gab.getBottom();
	Gab.getMessageCount();
	ev.stopPropagation();
})

//获取聊天历史记录
function getChatHistory(_name) {
	for (var i = 0; i < objArr.length; i++) {
		if (objArr[i].name == _name) {
			var _str = '';
			// console.log(mySrc);
			for (var j = 0; j < objArr[i].data.length; j++) {
				//判断收到的消息
				if (objArr[i].data[j].from != '') {
					if (objArr[i].data[j].from.type) {
						if (objArr[i].data[j].from.type == 1) {
							var shareStr = objArr[i].data[j].from.shareImageUrl;
							if (shareStr == '') {
								shareStr = '/img/friendShareDefalt.png';
							}
							_str += '<div class="elseMessage">' +
								'<span>' +
								'<img style="width: 100%;height: 100%;" src="' + $('.topImg>img').attr('src') + '">' +
								'</span>' +
								'<i></i>' +
								'<div class="friendShare" style="float: left;">' +
								'<dl>' +
								'<dt class="friendShareImg"><a href="' + objArr[i].data[j].from.shareUrl + '">' +
								'<img style="width: 100%;height: 100%;" src="' + shareStr + '">';
							if (objArr[i].data[j].from.shareImageType == 1) {
								_str += '<div class="videoPoster"><img src="/img/xx_shipin.png"></div>';
							}
							_str += '</a></dt>' +
								'<dd class="shareTittle">圈子分享</dd>' +
								' <dd><a class="shareContent" href="' + objArr[i].data[j].from.shareUrl + '">' + objArr[i].data[j].from.shareTitle + '</a></dd>' +
								'<div class="clear"></div>' +
								'</dl>' +
								'</div>' +
								'</div>';
						} else if (objArr[i].data[j].from.type == 0) {
							var cardSrc = '';
							if (objArr[i].data[j].from.imgSrc.indexOf('http://') > -1) {
								cardSrc = objArr[i].data[j].from.imgSrc;
							} else {
								cardSrc = ImgHOST() + objArr[i].data[j].from.imgSrc;
							}
							console.log(cardSrc);
							_str += '<div class="elseMessage"><span>' +
								'<img style="width: 100%;height: 100%;" src="' + $('.topImg>img').attr('src') + '"></span><i></i>' +
								'<div class="idCard"  data-othername="' + objArr[i].data[j].from.othername + '" style="float: left;"><p class="idCardTittle">个人名片</p>' +
								'<dl><dt class="cardImg" ><img src="' + cardSrc + '"></dt>' +
								'<dd class="cardNikeName" ><span>' + objArr[i].data[j].from.nickname + '</span></dd>' +
								'<dd class="cardTel">圈子号：<span>' + objArr[i].data[j].from.magicno + '</span></dd>' +
								'<div class="clear"></div></dl><div class="clear"></div></div></div>';
						} else if (objArr[i].data[j].from.type == 2) {
							_str += '<div class="elseMessage"><span>' +
								'<img style="width: 100%;height: 100%;" src="' + $('.topImg>img').attr('src') + '"></span>' +
								'<i></i><div class="idCard sendCicleInfo" data-code="' + objArr[i].data[j].from.code +
								' "data-cache="' + objArr[i].data[j].from.cache + '" style="float: left;"><p class="idCardTittle">推荐圈子</p>' +
								'<dl><dt class="cardImg"><img src="' + objArr[i].data[j].from.circleImg + '">' +
								'</dt><dd class="cardNikeName"><span>' + objArr[i].data[j].from.circleName + '</span>' +
								'</dd><dd class="cardTel"><span>' + objArr[i].data[j].from.member + '</span>人加入 | <span>' + objArr[i].data[j].from.activeNum + '</span>人活跃' +
								'</dd><div class="clear"></div></dl></div></div>';
						}
					} else {
						var userAvatar = objArr[i].data[j].fromSrc;
						// console.log(userAvatar)
						if (objArr[i].data[j].from.indexOf('-s') > -1) {
							_str += '<div class="elseMessage" data-video="' + objArr[i].data[j].from.slice(0, -8) + '">' +
								'<span>' +
								'<img style="width: 100%;height: 100%;" src="' + $('.topImg>img').attr('src') + '">' +
								'</span>' +
								'<i></i>' +
								'<span style="display: inline-block;max-width:300px;position: relative;">' +
								'<img class="video-show" style="width:200px;height:170px;" src="' + objArr[i].data[j].from.slice(0, -6) + '">' +
								'<div class="chat_video_play"></div>' +
								'<div class="video_time">' + objArr[i].data[j].from.slice(-5) + '</div>' +
								'</span>' +
								'<div class="clear"></div>' +
								'</div>';
						} else if (objArr[i].data[j].from.indexOf('https://') > -1) {
							_str += '<div class="elseMessage">' +
								'<span>' +
								'<img style="width: 100%;height: 100%;" src="' + ((userAvatar) ? userAvatar : $('.topImg>img').attr('src')) + '">' +
								'</span><i></i>' +
								'<span style="display: inline-block;max-width:300px;"><img class="msg-img" style="width:110px;height:110px;" src="' + objArr[i].data[j].from + '">' +
								'</span><div class="clear"></div></div>';
						} else {
							_str += '<div class="elseMessage">' +
								'<span>' +
								'<img style="width: 100%;height: 100%;" src="' + ((userAvatar) ? userAvatar : $('.topImg>img').attr('src')) + '">' +
								'</span><i></i>' +
								'<span style="background: #e5e5e5;color: #333333;display: inline-block;padding-left: 10px;padding-right: 10px;font-size: 12px;line-height: 34px;border-radius: 2px;word-wrap: break-word;max-width:300px;">' + toFaceImg(objArr[i].data[j].from) +
								'</span><div class="clear"></div></div>';
						}
					}
				}
				//判断发出去的消息
				if (objArr[i].data[j].to != '') {
					if (objArr[i].data[j].to.type) {
						if (objArr[i].data[j].to.type == 1) {
							var shareStr = objArr[i].data[j].to.shareImageUrl;
							if (shareStr == '') {
								shareStr = '/img/friendShareDefalt.png';
							}
							_str += '<div class="myMessage">' +
								'<span>' +
								'<img style="width: 100%;height: 100%;" src="' + mySrc + '">' +
								'</span>' +
								'<i></i>' +
								'<div class="friendShare">' +
								'<dl>' +
								'<dt class="friendShareImg"><a href="' + objArr[i].data[j].to.shareUrl + '">' +
								'<img style="width: 100%;height: 100%;" src="' + shareStr + '">';
							if (objArr[i].data[j].to.shareImageType == 1) {
								_str += '<div class="videoPoster"><img src="/img/xx_shipin.png"></div>';
							}
							_str += '</a></dt>' +
								'<dd class="shareTittle">圈子分享</dd>' +
								' <dd><a class="shareContent" href="' + objArr[i].data[j].to.shareUrl + '">' + objArr[i].data[j].to.shareTitle + '</a></dd>' +
								'<div class="clear"></div>' +
								'</dl>' +
								'</div>' +
								'</div>';
						} else if (objArr[i].data[j].to.type == 0) {
							_str += '<div class="myMessage">' +
								'<span><img style="width: 100%;height: 100%;" src="' + mySrc + '"></span>' +
								'<i></i><div class="idCard" data-othername="' + objArr[i].data[j].to.othername + '"><p class="idCardTittle">个人名片</p>' +
								'<dl><dt class="cardImg" ><img src="' + objArr[i].data[j].to.imgSrc + '"></dt>' +
								'<dd class="cardNikeName" ><span>' + objArr[i].data[j].to.nickname + '</span></dd>' +
								'<dd class="cardTel">圈子号：<span>' + objArr[i].data[j].to.magicno + '</span></dd>' +
								'<div class="clear"></div></dl></div></div>';
						} else if (objArr[i].data[j].to.type == 2) {
							_str += '<div class="myMessage"><span>' +
								'<img style="width: 100%;height: 100%;" src="' + mySrc + '">' +
								'</span><i></i><div class="idCard sendCicleInfo" data-code="' + objArr[i].data[j].to.code + ' "data-cache="' + objArr[i].data[j].to.cache + '">' +
								'<p class="idCardTittle">推荐圈子</p><dl><dt class="cardImg">' +
								'<img src="' + objArr[i].data[j].to.circleImg + '"></dt>' +
								'<dd class="cardNikeName"><span>' + objArr[i].data[j].to.circleName + '</span>' +
								'</dd><dd class="cardTel"><span>' + objArr[i].data[j].to.member + '</span>人加入 | <span>' +
								objArr[i].data[j].to.activeNum + '</span>人活跃' +
								'</dd><div class="clear"></div></dl></div></div>';
						}
					} else {
						// console.log('2222',objArr[i].data[j].to)
						if (objArr[i].data[j].to.indexOf('http') > -1) {
							_str += '<div class="myMessage">' +
								'<span>' +
								'<img style="width: 100%;height: 100%;" src="' + mySrc + '">' +
								'</span><i></i>' +
								'<span style="display: inline-block;float: right;max-width:300px;"><img class="msg-img" style="width:110px;height:110px;" src="' + objArr[i].data[j].to + '">' +
								'</span><div class="clear"></div></div>';
						} else {
							_str += '<div class="myMessage">' +
								'<span>' +
								'<img style="width: 100%;height: 100%;" src="' + mySrc + '">' +
								'</span><i></i>' +
								'<span style="background: #9ce554;color: #333333;display: inline-block;padding-left: 10px;padding-right: 10px;font-size: 12px;line-height: 34px;float: right;border-radius: 2px;word-wrap: break-word;max-width:300px;">' + toFaceImg(objArr[i].data[j].to) +
								'</span><div class="clear"></div></div>';
						}
					}
				}
			};
			$('.message').html(_str);
		}
	}
};
//得到自己的头像
function getMySrc() {
	if (getCookie('headImgkz') == '' || getCookie('headImgkz') == 'undefined') {
		mySrc = '/img/first.png';
	} else {
		if (getCookie("headImgkz").indexOf("http") > -1) {
			mySrc = getCookie('headImgkz');
		} else {
			mySrc = ImgHOST() + getCookie('headImgkz');
		}
	}
	return mySrc;
}