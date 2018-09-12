'use strict';

//一般直接写在一个js文件中
layui.use(['layer', 'element', 'carousel'], function () {
	var layer = layui.layer,
	    Delement = layui.element,
	    //导航
	carousel = layui.carousel; //轮播
	var channelId = "youlike"; //新闻导航
	var channelName = "推荐";
	var userID = Math.floor(Math.random() * 99 + 1); //随机userId请求新闻导航和新闻列表
	carousel.render({
		elem: '#banner',
		width: '100%' //设置容器宽度

		, arrow: 'none' //始终显示箭头

		, anim: 'fade' //切换动画方式

		, autoplay: 'true',
		interval: 1500,
		indicator: 'inside'
	});
	var loadTime; //文章加载时间
	var baseTime = 0; //递增时间
	var initTime = new Date().getTime(); //初始化时间
	var readLocation = true; //是否显示阅读位置刷新
	var videoBoxDom, videoInfoDom, videoBoxTopDom, videoInfoTopDom;
	var videoBaseNum = 0;
	var isVideo = false; //是否视频列表页面
	var isHome = getUrlParam("isHome"),
	    type_ = getUrlParam("type"),
	    id_ = getUrlParam("id"),
	    extdata_ = getUrlParam("extdata"),
	    title_ = getUrlParam("title"),
	    cdnUrl_ = getUrlParam("cdnUrl");
	/**
  * 初始化加载
  */
	//topNews();//顶部新闻
	sideLink(); //侧边链接
	//banner(true);//banner轮播热门推荐
	//videoList();//视频加载
	/**
  * 天气
  */
	axios({
		url: 'https://restapi.amap.com/v3/weather/weatherInfo',
		method: 'get', // 默认是 get9
		params: {
			key: "dfb9a576fbcb2c9a13a65ab736e47004",
			city: "杭州",
			extensions: "base"
		}
	}).then(function (res) {
		var data = res.data.lives[0];
		$(".weather").html('\n\t\t\t<span>' + data.city + '&nbsp;</span>\n\t\t\t<span>' + data.temperature + '\xB0&nbsp;</span>\n\t\t\t<span>' + data.weather + '&nbsp;</span>\t\n\t\t\t<span>' + data.winddirection + '\u98CE&nbsp;</span>\t\t\n\t\t');
	}).catch(function (error) {
		console.log(error);
	});
	/**
  * 新闻导航(选项卡)
  */
	axios({
		url: '/news/channels',
		method: 'get', // 默认是 get9			  
		baseURL: TJY.baseUrl(2)
	}).then(function (res) {
		var data = res.data.data;
		var html1 = '';
		var html2 = "";
		var more = '<li class="kindItem more">\u66F4\u591A\n\t\t\t\t\t<ul class="moreKind">\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t</ul>\n\t\t\t\t</li>';
		data.map(function (item, index) {
			if (index < 7) {
				html1 += '<li class="kindItem" data-channelId="' + item.channelId + '" data-channelName="' + item.name + '" >' + item.name + '</li>';
			} else {
				html2 += '<li class="kindItem" data-channelId="' + item.channelId + '" data-channelName="' + item.name + '">' + item.name + '</li>';
			}
		});
		$(".newsKind").append(html1 + more);
		$(".moreKind").append(html2);
		//更多
		$(".more").hover(function () {
			$(".moreKind").toggle("fast");
		});
		$(".kindItem").off("click").on("click", {
			tab: "tab"
		}, newsKind);
		isWangba(); //是否来自网吧
		//$(".kindItem").eq(0).trigger("click");
	}).catch(function (error) {
		console.log(error);
	});
	/**
  * 
  * @param {Object} event 新闻导航事件
  */
	function newsKind(event) {
		//如果选项卡首次加载清空newsKind,下滑加载不清除	
		if (event.data.tab == "tab") {
			$('html , body').animate({
				scrollTop: 0
			}, 'fast');
			//是否video
			if (isVideo) {
				$("#news").show();
				$("#video").hide();
				$(".videoList").html("");
				$(".video_").html("");
				$(".videoBox").remove();
				$(".topVideo").html("");
				$(".getVideo").removeClass("getVideo-active");
				isVideo = false;
				$(".locationV").hide();
			}
			$(".dropload").remove();
			$(".location").hide();
			baseTime = 0;
			$(".newsList").html("");
			$(".hotList").html("");
			channelId = $(this).attr("data-channelId");
			topNews();
			$(this).addClass('kindItem-active').siblings().removeClass("kindItem-active");
			$(".newsList").attr("data-channelId", channelId);
			readLocation = true;
		} else {
			channelId = $(".newsList").attr("data-channelId");
			readLocation = false;
		}
		if (channelId == "youlike") {
			banner(true);
		} else {
			banner(false);
		}
		newsCon("tab");
		event.stopPropagation();
	}
	/**
  * newsCon 新闻列表
  */
	function newsCon(type) {
		$('#news').dropload({
			scrollArea: window,
			loadDownFn: function loadDownFn(me) {
				$(".dropload").show();
				$.ajax({
					type: "GET",
					url: TJY.baseUrl(2) + "/information/list/test",
					dataType: 'json',
					data: {
						c: channelId,
						device: 2,
						userId: userID,
						random: Math.random() * (1000 + 1)
					},
					success: function success(res) {
						console.log(res);
						var html = "";
						if (res.result.status == "success") {
							var data = res.data;
							//console.log("新闻", data);
							loadTime = baseTime;
							data.map(function (item, index) {
								var showTime = (loadTime + Math.floor(Math.random() * 180 + 1)) * 1000; //文章显示时间（载入时间+递增+随机时间）	
								if (index > 1) {
									html += '\n\t\t\t\t\t\t\t\t\t\t<li class="newsItem">\n\t\t\t\t\t\t\t\t\t\t\t<a class="visited" href="./article\n\t\t.html?' + encodeURI(item.obj.url) + '&channelName=' + encodeURI(item.obj.channelName) + '"' + (' target="_blank">\n\t\t\t\t\t\t\t\t\t\t\t<div class="lbox">\n\t\t\t\t\t\t\t\t\t\t\t\t <img class="img" src="' + item.obj.picUrl + '" alt="" />\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t<div class="itemInner">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="item-title">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + item.obj.title + '\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="footer">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div class="footer-left">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<a class="avatar" href="#"><img src="' + item.obj.picUrl + '" alt="" /></a>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<a class="source" href="#">' + item.obj.author + '</a>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<a class="read" href="#">' + item.obj.readCnt + '\u9605\u8BFB</a>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<a class="time" href="#" data-loadTime="' + showTime + '">' + showTime + '</a>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t\t\t');
								}
							});
							// 如果没有数据
						} else {
							// 锁定
							me.lock();
							// 无数据
							me.noData();
						}
						if (readLocation) {
							setTimeout(function () {
								$(".location").show();
							}, 2000);
							readLocation = false;
						} else {
							//tip();
						}
						$(".newsList").append(html);
						baseTime += 300;
						//阅读时间
						updataTime();
						$(".dropload-down").remove();
						$(".dropload").hide();
						// 每次数据插入，必须重置
						me.resetload();
					},
					error: function error(xhr, type) {
						//alert('Ajax error!');
						// 即使加载出错，也得重置
						me.resetload();
					}
				});
			}
		});
	}
	//侧边链接
	function sideLink(type) {
		$(".r").on("click", function () {
			$("#mask").show();
			$(".content").addClass("maskAni");
			$(".content1").hide();
			$(".content2").show();
		});
		$(".rank").on("click", function () {
			$("#mask").show();
			$(".content").addClass("maskAni");
			$(".content1").hide();
			$(".content2").show();
		});

		$.ajax({
			type: "GET",
			url: TJY.baseUrl(2) + "/investment/task/list?pageNo=1&userId=2",
			dataType: 'json',
			success: function success(res) {
				var data = res.data;
				console.log(data);
				var html = "";
				$.each(data, function (i, item) {
					html += '\n\t\t\t\t\t\t<div class="item">\n\t\t\t\t\t\t\t<div class="logo"><img src="' + item.logoUrl + '" alt="" /></div>\n\t\t\t\t\t\t\t<div class="name">' + item.taskName + '</div>\n\t\t\t\t\t\t\t<div class="gold">' + item.rebateAmount + '\u5143\u5956\u52B1</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t';
				});
				$(".rank").html(html);
			},
			error: function error(_error) {
				console.log(_error);
			}
		});
		//		axios({
		//				url: '/list/banner/pc',
		//				method: 'get', // 默认是 get9			  
		//				baseURL: TJY.baseUrl(2),
		//			})
		//			.then(function(res) {
		//				const data = res.data.data;
		//				console.log("侧边链接", data);
		//				let html = "";
		//				data.map(function(item, index) {
		//					html += `
		//				<div class="r r1"><img src="${item.imgUrl}" alt="" /></div>
		//			`;
		//				});
		//				$(".right").html(html);
		//				$(".r").on("click", function() {
		//					$("#mask").show();
		//					$(".content").addClass("maskAni");
		//					$(".content1").hide();
		//					$(".content2").show();
		//				})
		//			})
		//			.catch(function(error) {
		//				console.log(error);
		//			});
	}
	//banner轮播(热门推荐)
	function banner(isShow) {
		if (isShow) {
			$("#banner").show();
			axios({
				url: 'getHotToday',
				method: 'get', // 默认是 get9			  
				baseURL: TJY.baseUrl(2)
			}).then(function (res) {
				var data = res.data.data;
				//console.log(data)
				var html = "";
				data.map(function (item, index) {
					html += '\n\t\t\t\t\t<div>\n\t\t\t  \t\t\t<a href="./article.html?' + item.url + '&channelName=' + escape(channelName) + '" target="_blank" style="background-image:url(' + item.imgUrl + ')">\n\t\t\t\t  \t\t\t<div style="height:250px;"></div>\n\t\t\t\t  \t\t\t<p class="page1">' + item.title + '</p>\n\t\t\t  \t\t\t</a>\n\t\t\t  \t\t</div>\n\t\t\t\t';
				});
				$("#bannerC").html('<div>\n\t\t\t  \t\t\t<a href="#" style="background-image:url(./img/banner.jpg)">\n\t\t\t  \t\t\t</a>\n\t\t\t  \t\t</div>' + html);
				carousel.render({
					elem: '#banner',
					width: '100%' //设置容器宽度

					, arrow: 'none' //始终显示箭头

					, anim: 'fade' //切换动画方式

					, autoplay: 'true',
					interval: 1500,
					indicator: 'inside'
				});
			}).catch(function (error) {
				console.log(error);
			});
		} else {
			$("#banner").hide();
		};
	}
	//头部新闻
	function topNews() {
		$.ajax({
			type: "GET",
			url: TJY.baseUrl(2) + "/information/list/test",
			dataType: 'json',
			cache: false,
			data: {
				c: channelId,
				device: 2,
				userId: Math.floor(Math.random() * 99 + 1),
				random: Math.random() * (1000 + 1)
			},
			success: function success(res) {
				if (res.data) {
					$(".newsList").prepend($(".hotList").html());
				}
				updataTime();
				var html = "";
				if (res.result.status == "success") {
					var data = res.data;
					console.log("zhiding", data);
					data.map(function (item, index) {
						var showTime = Math.floor(Math.random() * 60 + 1) * 1000; //文章显示时间（载入时间+递增+随机时间）				
						html += '\n\t\t\t\t\t\t\t<li class="newsItem">\n\t\t\t\t\t\t\t\t\t<a class="visited" href="./article\n.html?' + encodeURI(item.obj.url) + '&channelName=' + encodeURI(item.obj.channelName) + '"' + (' target="_blank">\n\t\t\t\t\t\t\t<div class="lbox">\n\t\t\t\t\t\t\t\t <img class="img" src="' + item.obj.picUrl + '" alt="" />\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div class="itemInner">\n\t\t\t\t\t\t\t\t\t<div class="item-title">\n\t\t\t\t\t\t\t\t\t\t' + item.obj.title + '\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class="footer">\n\t\t\t\t\t\t\t\t\t\t<div class="footer-left">\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="avatar" href="#"><img src="' + item.obj.picUrl + '" alt="" /></a>\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="source" href="#">' + item.obj.author + '</a>\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="read" href="#">' + item.obj.readCnt + '\u9605\u8BFB</a>\n\t\t\t\t\t\t\t\t\t\t\t\t<a class="time topTime" href="#" data-loadTime="' + showTime + '">\u521A\u521A</a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t');
					});
				}
				//阅读时间
				$(".hotList").html(html);
				$(".topTime").map(function (index, item) {
					var lefTime = parseInt(item.dataset.loadtime);
					var showTime = countdown(lefTime);
					item.innerHTML = showTime;
				});
				tip(res.data.length);
				//				$(".updata").stop().animate({
				//					height: 30
				//				}, 500);
				//				setTimeout(function() {
				//					$(".updata").stop().animate({
				//						height: 0
				//					}, 500);
				//				}, 1500);
			},
			error: function error(xhr, type) {
				//alert('Ajax error!');
				// 即使加载出错，也得重置
			}
		});
	}
	/**
  * 视频更新头部
  */
	function topVideo(isUpdataV) {
		$(".videoList").prepend($(".topVideo").html());
		$(".locationV").remove();
		$.ajax({
			type: "GET",
			url: TJY.baseUrl(2) + "/video/pcList",
			dataType: 'json',
			data: {
				channelId: 24,
				device: 2,
				userId: Math.floor(Math.random() * 99 + 1),
				videoOsType: "pc",
				backdata: 1,
				ip: "192.168.0.1"
			},
			success: function success(res) {
				//console.log(videoBaseNum);
				//console.log("头部视频", res.data);
				var html = "";
				if (res.result.status == "success") {
					var data = res.data;
					loadTime = baseTime;
					data.map(function (item, index) {
						html += '\n\t\t\t\t\t\t<li class="videoItemTop" data-index="' + index + '" data-type="' + item.type + '" data-url="' + item.obj.cdnUrl + '" data-extdata="' + item.obj.extdata + '" data-id="' + item.obj.id + '" data-title="' + item.obj.title + '">\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t<dl class="videoInfoTop videoInfoTop' + index + '" data-index=' + index + '>\n\t\t\t\t\t\t\t\t\t<dd class="poster"><img src="' + item.obj.url + '" alt="" /><div class="iconfont">&#xe600;</div></dd>\n\t\t\t\t\t\t\t\t\t<dt class="videoName">' + item.obj.title + '</dt>\n\t\t\t\t\t\t\t</dl>\n\t\t\t\t\t\t</li>\n\t\t\t\t\t';
					});
					// 如果没有数据
				}
				$(".topVideo").html(html + '<div class="locationV" style="display:block;float:left;width:660px;">\u521A\u521A\u64AD\u653E\u5230\u8FD9\u91CC&nbsp;\u70B9\u51FB\u5237\u65B0<i class="iconfont">&#xe649;</i></div>');
				//$('body').off('click').on('click', ".videoItemTop",				
				$(".videoItemTop").on("click", function () {
					$('.videoInfo').show();
					$('.videoInfo').parent().addClass("videoItem");
					//console.log("视频点击",$(this).index());
					var videoIndex = $(this).index();
					if (videoIndex == 9) {
						$(".videoItemTop").eq(8).hide();
					} else {
						$(".videoItemTop").eq(9).hide();
					}
					//获取视频地址
					var videoUrl = void 0;
					var type = $(this).attr("data-type"),
					    cdnUrl = $(this).attr("data-Url").replace("http", "https"),
					    id = $(this).attr("data-id"),
					    extdata = $(this).attr("data-extdata"),
					    title = $(this).attr("data-title");
					if (type == 0) {
						$.ajax({
							type: "GET",
							url: TJY.baseUrl(2) + '/video/datil',
							data: {
								userId: userID,
								osType: "pc",
								id: id,
								extdata: extdata,
								ip: "192.168.0.1"
							},
							dataType: "json",
							async: false,
							success: function success(data) {
								videoUrl = data.data.cdnUrl;
							}
						});
					} else {
						videoUrl = cdnUrl;
					};
					$(".videoBoxTop").remove();
					$(".videoBox").remove();
					$('.videoInfoTop' + videoInfoTopDom).show();
					$('.videoInfoTop' + videoInfoTopDom).parent().addClass("videoItemTop");
					var indexRender = $(this).attr("data-index");
					var index = $(this).index();
					var indexT = true;
					var videoHtml = '<div class="videoBoxTop">\n\t\t\t\t\t\t\t<video id="my-video" class="video-js myVideo" controls preload="auto" poster="" data-setup="{}" webkit-playsinline="true" playsinline="true">\n\t\t\t\t        <source class="videoSrc" src="' + videoUrl + '" type="video/mp4">\n\t\t\t\t        <p class="vjs-no-js"> To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a> </p>\n\t\t\t\t      </video>\n\t\t\t\t      <script src="./js/video.min.js"></script> \n\t\t\t\t      <script src="./js/videoTitTab.js"></script>\t\n\t\t\t\t\t  <script src="https://vjs.zencdn.net/5.19/lang/zh-CN.js"></script>\n\t\t\t\t      <script type="text/javascript">\n\t\t\t\t\t\t\tvar myPlayer = videojs(\'my-video\');\n\t\t\t\t\t\t\tvideojs("my-video").ready(function(){\n\t\t\t\t\t\t\t\tvar myPlayer = this;\n\t\t\t\t\t\t\t\tmyPlayer.play();\t\t\t\t\n\t\t\t\t\t\t\t});\t\t\n\t\t\t\t\t\t\tmyPlayer.addChild(\'TitleBar\', {text: \'' + title + '\'});\n\t\t\t\t\t\t</script> \n\t\t\t\t\t</div>';
					index % 2 == 0 ? indexT = true : indexT = false;
					if (indexT) {
						$(this).before(videoHtml);
					} else {
						$('.videoInfoTop' + (indexRender - 1)).parent().before(videoHtml);
					}
					$(this).find('.videoInfoTop').hide();
					$(this).removeClass("videoItemTop");
					var videoBoxOffset = $('.videoBoxTop').offset().top - 34;
					//$(window).scrollTop($('.videoBox').offset().top-34);
					$('html , body').animate({
						scrollTop: videoBoxOffset
					}, 'fast');
					//记录显示隐藏的videoInfo 
					videoInfoTopDom = index;
				});

				//隐藏dropload加载状态
				$(".dropload-down").remove();
				$(".dropload").hide();
				//刷新视频
				$(".locationV").on("click", function (event) {
					$('html , body').animate({
						scrollTop: 0
					}, 'fast');
					topVideo(true);
				});
				// 更新提示
				if (isUpdataV) {
					tipV(res.data.length);
				}
			},
			error: function error(xhr, type) {
				// 即使加载出错，也得重置

			}
		});
	}
	/**
  * 视频列表
  */
	$(".getVideo").on("click", videoList);
	/**
  * 是否来自网吧链接
  */
	function isWangba() {
		//网吧视频链接载入
		var videoUrl_;
		if (isHome == "true") {
			$(".getVideo").trigger("click");
			if (type_ == 0) {
				$.ajax({
					type: "GET",
					url: TJY.baseUrl(2) + '/video/datil',
					data: {
						userId: userID,
						osType: "pc",
						id: id_,
						extdata: extdata_,
						ip: "192.168.0.1"
					},
					dataType: "json",
					async: false,
					success: function success(data) {
						//console.log("视频详情链接", data);
						videoUrl_ = data.data.cdnUrl;
					}
				});
			} else {
				videoUrl_ = cdnUrl_;
			};
			//			console.log("网吧视频地址");
			var videoHtml_ = '<div class="videoBox">\n\t\t\t\t\t\t\t\t<video id="my-video" class="video-js myVideo" controls preload="auto" poster="" data-setup="{}" webkit-playsinline="true" playsinline="true">\n\t\t\t\t\t        <source class="videoSrc" src="' + videoUrl_ + '" type="video/mp4">\n\t\t\t\t\t        <p class="vjs-no-js"> To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a> </p>\n\t\t\t\t\t      </video>\n\t\t\t\t\t      <script src="./js/video.min.js"></script> \n\t\t\t\t\t      <script src="./js/videoTitTab.js"></script>\t\n\t\t\t\t\t\t  <script src="https://vjs.zencdn.net/5.19/lang/zh-CN.js"></script>\n\t\t\t\t\t      <script type="text/javascript">\n\t\t\t\t\t\t\t\tvar myPlayer = videojs(\'my-video\');\n\t\t\t\t\t\t\t\tvideojs("my-video").ready(function(){\n\t\t\t\t\t\t\t\t\tvar myPlayer = this;\n\t\t\t\t\t\t\t\t\tmyPlayer.play();\t\t\t\t\n\t\t\t\t\t\t\t\t});\t\t\n\t\t\t\t\t\t\t\tmyPlayer.addChild(\'TitleBar\', {text: \'' + title_ + '\'});\n\t\t\t\t\t\t\t</script> \n\t\t\t\t\t\t</div>';
			$(".video_").html(videoHtml_);
		} else {
			$(".kindItem").eq(0).trigger("click");
		}
	}

	function videoList() {
		topVideo();
		$("#video").show();
		isVideo = true;
		var locationN = 0;
		$("#news").hide();
		$(".getVideo").addClass("getVideo-active");
		$(".kindItem").removeClass("kindItem-active");
		$('#video').dropload({
			scrollArea: window,
			loadDownFn: function loadDownFn(me) {
				$(".dropload").show();
				$.ajax({
					type: "GET",
					url: TJY.baseUrl(2) + "/video/pcList",
					dataType: 'json',
					data: {
						channelId: 24,
						device: 2,
						userId: Math.floor(Math.random() * 99 + 1),
						videoOsType: "pc",
						backdata: 1,
						ip: "192.168.0.1"
					},
					success: function success(res) {
						locationN++;
						//						console.log(videoBaseNum);
						//						console.log("视频", res.data);
						var html = "";
						if (res.result.status == "success") {
							var data = res.data;
							loadTime = baseTime;
							data.map(function (item, index) {
								html += '\n\t\t\t\t\t\t\t\t<li class="videoItem" data-index="' + (videoBaseNum + index) + '" data-type="' + item.type + '" data-url="' + item.obj.cdnUrl + '" data-extdata="' + item.obj.extdata + '" data-id="' + item.obj.id + '" data-title="' + item.obj.title + '">\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t<dl class="videoInfo videoInfo' + (videoBaseNum + index) + '" data-index=' + (videoBaseNum + index) + '>\n\t\t\t\t\t\t\t\t\t\t\t<dd class="poster"><img src="' + item.obj.url + '" alt="" /><div class="iconfont">&#xe600;</div></dd>\n\t\t\t\t\t\t\t\t\t\t\t<dt class="videoName">' + item.obj.title + '</dt>\n\t\t\t\t\t\t\t\t\t</dl>\n\t\t\t\t\t\t\t\t</li>\n\t\t\t\t\t\t\t';
							});
							// 如果没有数据
						} else {
							// 锁定
							me.lock();
							// 无数据
							me.noData();
						}
						$(".videoList").append(html);
						videoBaseNum += 10;
						$('body').off('click').on('click', ".videoItem", function () {
							$(".videoItemTop").show();
							$(".videoInfoTop").show();
							$(".videoBox").remove();
							$(".videoBoxTop").remove();
							$('.videoInfoTop').parent().addClass("videoItemTop");
							$('.videoInfo').parent().addClass("videoItem");
							$('.videoInfo').show();
							//获取视频地址
							var videoUrl = void 0;
							var type = $(this).attr("data-type"),
							    cdnUrl = $(this).attr("data-Url").replace("http", "https"),
							    id = $(this).attr("data-id"),
							    extdata = $(this).attr("data-extdata"),
							    title = $(this).attr("data-title");
							if (type == 0) {
								$.ajax({
									type: "GET",
									url: TJY.baseUrl(2) + '/video/datil',
									data: {
										userId: userID,
										osType: "pc",
										id: id,
										extdata: extdata,
										ip: "192.168.0.1"
									},
									dataType: "json",
									async: false,
									success: function success(data) {
										console.log("视频详情链接", data);
										videoUrl = data.data.cdnUrl;
									}
								});
							} else {
								videoUrl = cdnUrl;
							};
							//console.log("播放地址", videoUrl);
							var indexRender = $(this).attr("data-index");
							var index = $(this).index();
							var indexT = true;
							var videoHtml = '<div class="videoBox">\n\t\t\t\t\t\t\t\t\t<video id="my-video" class="video-js myVideo" controls preload="auto" poster="" data-setup="{}" webkit-playsinline="true" playsinline="true">\n\t\t\t\t\t\t        <source class="videoSrc" src="' + videoUrl + '" type="video/mp4">\n\t\t\t\t\t\t        <p class="vjs-no-js"> To view this video please enable JavaScript, and consider upgrading to a web browser that <a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a> </p>\n\t\t\t\t\t\t      </video>\n\t\t\t\t\t\t      <script src="./js/video.min.js"></script> \n\t\t\t\t\t\t      <script src="./js/videoTitTab.js"></script>\t\n\t\t\t\t\t\t\t  <script src="https://vjs.zencdn.net/5.19/lang/zh-CN.js"></script>\n\t\t\t\t\t\t      <script type="text/javascript">\n\t\t\t\t\t\t\t\t\tvar myPlayer = videojs(\'my-video\');\n\t\t\t\t\t\t\t\t\tvideojs("my-video").ready(function(){\n\t\t\t\t\t\t\t\t\t\tvar myPlayer = this;\n\t\t\t\t\t\t\t\t\t\tmyPlayer.play();\t\t\t\t\n\t\t\t\t\t\t\t\t\t});\t\t\n\t\t\t\t\t\t\t\t\tmyPlayer.addChild(\'TitleBar\', {text: \'' + title + '\'});\n\t\t\t\t\t\t\t\t</script> \n\t\t\t\t\t\t\t</div>';
							index % 2 == 0 ? indexT = true : indexT = false;
							if (indexT) {
								$(this).before(videoHtml);
							} else {
								$('.videoInfo' + (indexRender - 1)).parent().before(videoHtml);
							}
							$(this).find('.videoInfo').hide();
							$(this).removeClass("videoItem");
							var videoBoxOffset = $('.videoBox').offset().top - 34;
							//$(window).scrollTop($('.videoBox').offset().top-34);
							$('html , body').animate({
								scrollTop: videoBoxOffset
							}, 'fast');
							//记录显示隐藏的videoInfo 
							videoInfoDom = index;
						});
						//隐藏dropload加载状态
						$(".dropload-down").remove();
						$(".dropload").hide();
						// 每次数据插入，必须重置					
						me.resetload();
						//显示播放位置					
						if (locationN == 2) {
							setTimeout(function () {
								$(".locationV").show();
							}, 2000);
						}
					},
					error: function error(xhr, type) {
						// 即使加载出错，也得重置
						me.resetload();
					}
				});
			}
		});
	}
	//视频更新tip
	function tipV() {
		var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

		$(".updataV").show();
		// 插入数据到页面，放到最后面
		$(".updataV").html('\u4E3A\u4F60\u63A8\u8350\u4E86' + len + '\u4E2A\u89C6\u9891');
		$(".updataV").stop().animate({
			height: 30
		}, 500);
		setTimeout(function () {
			$(".updataV").stop().animate({
				height: 0
			}, 500);
		}, 1500);
	}
	//更新tip
	function tip() {
		var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

		$(".updataV").hide();
		// 插入数据到页面，放到最后面
		$(".updata").html('\u4E3A\u4F60\u63A8\u8350\u4E86' + len + '\u7BC7\u6587\u7AE0');
		$(".updata").stop().animate({
			height: 30
		}, 500);
		setTimeout(function () {
			$(".updata").stop().animate({
				height: 0
			}, 500);
		}, 1500);
	}
	//刷新新闻
	$(".location").on("click", function (evnet) {
		topNews();
		$('html , body').animate({
			scrollTop: 0
		}, 'fast');
	});
	$(".updataHot").on("click", function (event) {
		if (isVideo) {
			topVideo(true);
		} else {
			topNews();
		}
		$('html , body').animate({
			scrollTop: 0
		}, 'fast');
	});
	//回到顶部
	$(".top").on("click", function () {
		$('html , body').animate({
			scrollTop: 0
		}, 'fast');
	});
	/**
  * 时间计时
  */
	function countdown(leftTime) {
		//console.log(leftTime);
		var d, h, m, s;
		var showTime;
		if (leftTime >= 0) {
			d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
			h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
			m = Math.floor(leftTime / 1000 / 60 % 60);
			s = Math.floor(leftTime / 1000 % 60);
		}
		//将倒计时赋值到div中  				
		//console.log(`${h}:${m}:${s}`);
		if (m != 0 && h === 0) {
			if (m == "undefiend") {
				showTime = "刚刚";
			}
			showTime = m + "分钟前";
		} else if (m === 0) {
			if (s == "undefiend") {
				showTime = "刚刚";
			}
			//showTime = s+"秒前";
			showTime = "刚刚";
		} else if (h != 0) {
			if (h == "undefiend") {
				showTime = "刚刚";
			}
			showTime = h + "小时前";
		} else if (d != 0) {
			if (d == "undefiend") {
				showTime = "刚刚";
			}
			showTime = d + "天前";
		}
		return showTime;
	};
	/**
  * 获取时间戳兼容问题
  */
	function getTs(time) {
		var arr = time.split(/[- :]/),
		    _date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]),
		    timeStr = Date.parse(_date);
		return timeStr;
	}
	//	function topTime(){
	//		 $(".topTime").map(function(index,item){                    	
	//      	let lefTime = parseInt(item.dataset.loadtime);
	//      	let showTime = countdown(lefTime);
	//      	item.innerHTML = showTime;
	//     })		
	//	}
	function updataTime() {
		var nowTime = new Date().getTime();
		var timeAdd = nowTime - initTime;
		//console.log(timeAdd);
		$(".time").each(function (index, item) {
			var lefTime = parseInt(item.dataset.loadtime) + parseInt(timeAdd);
			//console.log(lefTime);
			var showTime = countdown(lefTime);
			item.innerHTML = showTime;
		});
	}
});
//弹出框
var autoMask = setTimeout(mask, 3000);
function mask(num) {
	$("#mask").show();
	$(".content").addClass("maskAni");
	if (num == 2) {
		$(".content1").hide();
		$(".content2").show();
	} else {
		$(".content2").hide();
		$(".content1").show();
	}
}

function maskHide() {
	$("#mask").hide();
}
$(document).ready(function () {
	var pic_url = getUrlParam("picture");
	$("#childpic").attr("src", pic_url);
	var content = getUrlParam("content");
	$("#content").html("<b>" + content + "</b>");
});

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //定义正则表达式 
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return decodeURIComponent(r[2]);
	return null;
};