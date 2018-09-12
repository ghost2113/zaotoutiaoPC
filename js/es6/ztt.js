//一般直接写在一个js文件中
layui.use(['layer', 'element', 'carousel'], function() {
	var layer = layui.layer,
		Delement = layui.element, //导航
		carousel = layui.carousel; //轮播
	var channelId = "youlike"; //新闻导航
	var channelName = "推荐";
	var userID = Math.floor(Math.random() * 99 + 1); //随机userId请求新闻导航和新闻列表
	var loadTime; //文章加载时间
	var baseTime = 0; //递增时间
	var initTime = new Date().getTime(); //初始化时间
	var readLocation = true; //是否显示阅读位置刷新
	var videoBoxDom, videoInfoDom, videoBoxTopDom, videoInfoTopDom;
	var videoBaseNum = 0;
	var isVideo = true; //是否视频列表页面
	var isHome = getUrlParam("isHome"),
		type_ = getUrlParam("type"),
		id_ = getUrlParam("id"),
		extdata_ = getUrlParam("extdata"),
		title_ = getUrlParam("title"),
		cdnUrl_ = getUrlParam("cdnUrl");
	/**
	 * 初始化
	 */
	sideLink(); //侧边链接
	/**
	 * 新闻导航(选项卡)
	 */
	$.ajax({
		type: "GET",
		url: TJY.baseUrl(2) + "/news/channels",
		dataType: 'json',
		success: function(res) {
			var data = res.data;
			//console.log(data);
			var html1 = "";
			var html2 = "";
			var more = `<li class="kindItem more">更多
					<ul class="moreKind">											
					</ul>
				</li>`;
			$.each(data, (index, item) => {
				//console.log(index);
				if(index < 7) {
					html1 += `<li class="kindItem" data-channelId="${item.channelId}" data-channelName="${item.name}" >${item.name}</li>`;
				} else {
					html2 += `<li class="kindItem" data-channelId="${item.channelId}" data-channelName="${item.name}">${item.name}</li>`;
				}
			});
			$(".newsKind").append(html1 + more);
			$(".moreKind").append(html2);
			//更多
			$(".more").hover(function() {
				$(".moreKind").toggle("fast");
			})
			$(".kindItem").on("click", {
				tab: "tab"
			}, newsKind);
			$(".kindItem").eq(0).trigger("click");
		},
		error: function(error) {
			console.log(error);
		}
	});
	/**
	 * 
	 * @param {Object} event 新闻导航事件
	 */
	function newsKind(event) {
		//如果选项卡首次加载清空newsKind,下滑加载不清除	
		if(event.data.tab == "tab") {
			//是否video
			if(isVideo) {
				$("#news").show();
				$("#video").hide();
				$(".videoList").html("");
				$(".topVideo").html("");
				$(".getVideo").removeClass("getVideo-active");
				isVideo = false;
				$(".locationV").hide();
			}
			$(".location").hide();
			baseTime = 0;
			$(".hotList").html("");
			$(".newsList").html("");
			channelId = $(this).attr("data-channelId");
			channelName = $(this).attr("data-channelName");
			topNews();
			$(this).addClass('kindItem-active').siblings().removeClass("kindItem-active");
			$(".newsList").attr("data-channelId", channelId)
			$('html , body').animate({
				scrollTop: 0
			}, 'fast');
			readLocation = true;
		} else {
			channelId = $(".newsList").attr("data-channelId")
			readLocation = false;
		}
		if(channelId == "youlike") {
			banner(true);
		} else {
			banner(false);
		}
		newsCon("tab");
		event.stopPropagation();
	}
	//头部新闻
	function topNews() {		
		$.ajax({
			type: "GET",
			url: TJY.baseUrl(2) + "/information/list/test",
			dataType: 'json',
			data: {
				c: channelId,
				device: 2,
				userId: Math.floor(Math.random() * 99 + 1),
				random: Math.floor(Math.random() * 1000 + 1),
			},
			success: function(res) {
				updataTime();
				$(".newsList").prepend($(".hotList").html());
				let html = "";
				if(res.result.status == "success") {
					const data = res.data;
					$.each(data, function(index, item) {
						let showTime = Math.floor(Math.random() * 60 + 1) * 1000; //文章显示时间（载入时间+递增+随机时间）				
						html += `
							<li class="newsItem">
									<a class="visited" href="./article
.html?${encodeURI(item.obj.url)}&channelName=` + encodeURI(item.obj.channelName) + '"' + ` target="_blank">
							<div class="lbox">
								 <img class="img" src="${item.obj.picUrl}" alt="" />
							</div>
							<div class="itemInner">
									<div class="item-title">
										${item.obj.title}
									</div>
									<div class="footer">
										<div class="footer-left">
												<span class="avatar" href="#"><img src="${item.obj.picUrl}" alt="" /></span>
												<span class="source" href="#">${item.obj.author}</span>
												<span class="read" href="#">${item.obj.readCnt}阅读</span>
												<span class="time topTime" href="#" data-loadTime="${showTime}">刚刚</span>
										</div>
									</div>
							</div>
							</a>
						</li>
					`;
					})
				}
				//阅读时间
				$(".hotList").html(html);
				updataTime();
				tip();
			},
			error: function(xhr, type) {
				//alert('Ajax error!');
				// 即使加载出错，也得重置
			}
		});
	}

	function newsCon(type) {
		$('#news').dropload({
			scrollArea: window,
			loadDownFn: function(me) {
				$(".dropload").show();
				$.ajax({
					type: "GET",
					url: TJY.baseUrl(2) + "/information/list/test/",
					dataType: 'json',
					data: {
						c: channelId,
						device: 2,
						userId: userID,
						random: Math.floor(Math.random() * (1000 + 1))
					},
					success: function(res) {
						let html = "";
						if(res.result.status == "success") {
							const data = res.data;
							//console.log(data);
							loadTime = baseTime;
							$.each(data, function(index, item) {
								let showTime = (loadTime + Math.floor(Math.random() * 180 + 1)) * 1000; //文章显示时间（载入时间+递增+随机时间）	
								if(index>1){
									html += `
											<li class="newsItem">
												<a class="visited" href="./article
			.html?${encodeURI(item.obj.url)}&channelName=` + encodeURI(item.obj.channelName) + '"' + ` target="_blank">
										<div class="lbox">
											 <img class="img" src="${item.obj.picUrl}" alt="" />
										</div>
										<div class="itemInner">
				
												<div class="item-title">
												${item.obj.title}
												</div>
												<div class="footer">
													<div class="footer-left">
															<span class="avatar" href="#"><img src="${item.obj.picUrl}" alt="" /></span>
															<span class="source" href="#">${item.obj.author}</span>
															<span class="read" href="#">${item.obj.readCnt}阅读</span>
															<span class="time topTime" href="#" data-loadTime="${showTime}">${countdown(showTime)}</span>
													</div>
												</div>								
										</div>
										</a>
									</li>
								`;
								}
											
								
							});
							// 如果没有数据
						} else {
							// 锁定
							me.lock();
							// 无数据
							me.noData();
						}
						if(readLocation) {
							setTimeout(function() {
								$(".location").show();
							}, 2000);
							readLocation = false;
						} else {
							tip();
						}
						$(".newsList").append(html);
						$(".location").on("click", function() {
							$('html , body').animate({
								scrollTop: 0
							}, 'fast');
						});
						baseTime += 300;
						//阅读时间
						updataTime();
						$(".dropload-down").remove();
						$(".dropload").hide();
						// 每次数据插入，必须重置
						me.resetload();
					},
					error: function(xhr, type) {
						//alert('Ajax error!');
						// 即使加载出错，也得重置
						me.resetload();
					}
				});
			}
		});
	}

	function banner(isShow) {
		if(isShow) {
			$("#banner").show();
			$.ajax({
				type: "GET",
				url: TJY.baseUrl(2) + "/getHotToday",
				dataType: 'json',
				success: function(res) {
					const data = res.data;
					//console.log("banner",data)
					let html = "";
					$.each(data, function(index, item) {
						var imgUrl = RegExp(/webp/g).test(item.imgUrl) ? item.imgUrl.replace('webp', 'jpg') : item.imgUrl;
						html += `
							<div>
					  			<a href="./article.html?${encodeURI(item.url)}&channelName=${encodeURI(channelName)}" target="_blank" >
					  				<img src="${imgUrl}" alt="">
						  			<p class="page1">${item.title}</p>
					  			</a>
					  		</div>
						`;
					});
					$("#bannerC").html(`<div>
			  			<a href="#">
			  				<img src="./img/banner.jpg" alt="">
			  			</a>
			  		</div>`+html);
					carousel.render({
						elem: '#banner',
						width: '100%' //设置容器宽度
							,
						arrow: 'none' //始终显示箭头
							,
						height: "230px",
						anim: 'fade' //切换动画方式
							,
						autoplay: 'true',
						interval: 1500,
						indicator: 'inside'
					});
				},
				error: function(error) {
					console.log(error);
				}
			});

		} else {
			$("#banner").hide();
		};
	}

	/**
	 * 侧边链接
	 */

	function sideLink(type) {
		$(".r").on("click", function() {
			$("#mask").show();
			$(".content").addClass("maskAni");
			$(".content1").hide();
			$(".content2").show();
		});
		$(".rank").on("click", function() {
			$("#mask").show();
			$(".content").addClass("maskAni");
			$(".content1").hide();
			$(".content2").show();
		});

		$.ajax({
			type: "GET",
			url: TJY.baseUrl(2) + "/investment/task/list?pageNo=1&userId=2",
			dataType: 'json',
			success: function(res) {
				const data = res.data;
				console.log(data);
				let html = "";
				$.each(data, function(i, item) {
					html += `
						<div class="item">
							<div class="logo"><img src="${item.logoUrl}" alt="" /></div>
							<div class="name">${item.taskName}</div>
							<div class="gold">${item.rebateAmount}元奖励</div>
						</div>
					`;
				});
				$(".rank").html(html);				
			},
			error: function(error) {
				console.log(error);
			}
		});
//		$.ajax({
//			type: "GET",
//			url: TJY.baseUrl(2) + "/list/banner/pc",
//			dataType: 'json',
//			success: function(res) {
//				const data = res.data;
//				//console.log("侧边链接", data);
//				let html = "";
//				$.each(data, function(index, item) {
//					html += `
//						<div class="r r1"><img src="${item.imgUrl}" alt="" /></div>
//					`;
//				});
//				$(".fixR").prepend(html);				
//			},
//			error: function(error) {
//				console.log(error);
//			}
//		});
//		$.ajax({
//				type: "GET",
//				url: TJY.baseUrl(2) + "/getHotToday",
//				dataType: 'json',
//				data:{
//					pageSize:2,
//					random: Math.floor(Math.random() * (1000 + 1))
//				},
//				success: function(res) {
//					console.log("res",res);
//					const data = res.rightList;
//					//console.log("侧边链接", data);
//					let html = "";
//					$.each(data, function(index, item) {						
//						html += `
//							<li><a href="./article.html?${encodeURI(item.url)}&channelName=${encodeURI("推荐")}" target="_blank"><span class="red">${index+1}</span>${item.title}</a></li>
//						`;
//					});
//					$(".rank_newsList").html(html);					
//				},
//				error: function(error) {
//					console.log(error);
//				}
//		})	
	}
	/**
	 * 热门排行
	 */
//	function sideLink(type) {
//		$.ajax({
//			type: "GET",
//			url: TJY.baseUrl(2) + "/list/banner/pc",
//			dataType: 'json',
//			success: function(res) {
//				const data = res.data;
//				//console.log("侧边链接", data);
//				let html = "";
//				$.each(data, function(index, item) {
//					html += `
//						<div class="r r1"><img src="${item.imgUrl}" alt="" /></div>
//					`;
//				});
//				$(".fixR").prepend(html);
//				$(".r").on("click", function() {
//					$("#mask").show();
//					$(".content").addClass("maskAni");
//					$(".content1").hide();
//					$(".content2").show();
//				});
//			},
//			error: function(error) {
//				console.log(error);
//			}
//		});
//	}
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
			success: function(res) {
				//console.log("头部视频", res.data);
				let html = "";
				if(res.result.status == "success") {
					const data = res.data;
					loadTime = baseTime;
					$.each(data, function(index, item) {
						html += `
						<li class="videoItem" data-index="${index}" data-type="${item.type}" data-url="${item.obj.cdnUrl}" data-extdata="${item.obj.extdata}" data-id="${item.obj.id}" data-title="${item.obj.title}">									
							<dl class="videoInfo">
									<dd class="poster"><img src="${item.obj.url}" alt="" /><div class="iconfont">&#xe600;</div></dd>
									<dt class="videoName">${item.obj.title}</dt>
							</dl>
						</li>
					`
					});
					// 如果没有数据
				}
				$(".topVideo").html(html + `<div class="locationV" style="display:block;float:left;width:475px;">刚刚播放到这里&nbsp;点击刷新<i class="iconfont">&#xe649;</i></div>`);
				$(".videoItem").on("click", function() {
					const type = $(this).attr("data-type"),
						cdnUrl = encodeURIComponent($(this).attr("data-Url").replace("http", "https")),
						id = encodeURIComponent($(this).attr("data-id")),
						extdata = encodeURIComponent($(this).attr("data-extdata")),
						title = encodeURIComponent($(this).attr("data-title"));
					window.location.href = `./home.html?isHome=true&type=${type}&title=${title}&id=${id}&extdata=${extdata}&cdnUrl=${cdnUrl}`;
				});
				//隐藏dropload加载状态												
				$(".dropload-down").remove();
				$(".dropload").hide();
				//刷新视频
				$(".locationV").on("click", function(event) {
					$('html , body').animate({
						scrollTop: 0
					}, 'fast');
					topVideo(true);
				});
				// 更新提示
				if(isUpdataV) {
					tipV();
				}

			},
			error: function(xhr, type) {
				// 即使加载出错，也得重置
			}
		})
	}
	/**
	 * 视频列表
	 */
	$(".getVideo").on("click", videoList);

	function videoList() {
		$("#news").hide();
		topVideo();
		$("#video").show();
		isVideo = true;
		var locationN = 0;
		var videoNum = 0;
		$(".getVideo").addClass("getVideo-active");
		$(".kindItem").removeClass("kindItem-active");
		$('#video').dropload({
			scrollArea: window,
			loadDownFn: function(me) {
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
					success: function(res) {
						locationN++;
						//console.log("视频", res.data);
						let html = "";
						if(res.result.status == "success") {
							const data = res.data;
							$.each(data, function(index, item) {
								html += `
								<li class="videoItem" data-type="${item.type}" data-url="${item.obj.cdnUrl}" data-extdata="${item.obj.extdata}" data-id="${item.obj.id}" data-title="${item.obj.title}" data-title="${item.obj.title}">									
									<dl class="videoInfo ">
										<dd class="poster"><img src="${item.obj.url}" alt="" /><div class="iconfont">&#xe600;</div></dd>
										<dt class="videoName">${item.obj.title}</dt>
									</dl>
								</li>
							`;
							});
						} else {
							// 锁定
							me.lock();
							// 无数据
							me.noData();
						}
						$(".videoList").append(html);
						$(".videoItem").on("click", function() {
							const type = $(this).attr("data-type"),
								cdnUrl = $(this).attr("data-Url").replace("http", "https"),
								id = $(this).attr("data-id"),
								title = $(this).attr("data-title"),
								extdata = $(this).attr("data-extdata");
							window.location.href = `./home.html?type=${type}&isHome=true&id=${encodeURIComponent(id)}&title=${encodeURIComponent(title)}&extdata=${encodeURIComponent(extdata)}&cdnUrl=${encodeURIComponent(cdnUrl)}`;
						});
						//隐藏dropload加载状态
						$(".dropload-down").remove();
						$(".dropload").hide();
						// 每次数据插入，必须重置					
						me.resetload();
						//显示播放位置					
						setTimeout(function() {
							$(".locationV").show();
						}, 2000);
					},
					error: function(xhr, type) {
						// 即使加载出错，也得重置
						me.resetload();
					}
				});
			}
		});
	}
	//视频更新tip
	function tipV(len = 10) {
		// 插入数据到页面，放到最后面
		$(".updataV").html(`为你更新了${len}个视频`);
		$(".updataV").stop().animate({
			height: 30
		}, 500);
		setTimeout(function() {
			$(".updataV").stop().animate({
				height: 0
			}, 500);
			$(".updataV").html(``);
		}, 1500);
	}
	//更新tip
	function tip(len = 10) {
		// 插入数据到页面，放到最后面
		$(".updata").html(`为你更新了${len}篇文章`);
		$(".updata").stop().animate({
			height: 30
		}, 500);
		setTimeout(function() {
			$(".updata").stop().animate({
				height: 0
			}, 500);
			$(".updata").html(``);
		}, 1500);
	}
	//刷新视频
	$(".locationV").on("click", function() {
		topVideo();
		$('html , body').animate({
			scrollTop: 0
		}, 'fast');
		topVideo(true);
	});
	//刷新新闻
	$(".location").on("click", function() {
		topNews();
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
		if(leftTime >= 0) {
			d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
			h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
			m = Math.floor(leftTime / 1000 / 60 % 60);
			s = Math.floor(leftTime / 1000 % 60);
		}
		//将倒计时赋值到div中  				
		//console.log(`${h}:${m}:${s}`);
		if(m != 0 && h === 0) {
			if(m == "undefiend") {
				showTime = "刚刚";
			}
			showTime = m + "分钟前";
		} else if(m === 0) {
			if(s == "undefiend") {
				showTime = "刚刚";
			}
			//showTime = s+"秒前";
			showTime = "刚刚";
		} else if(h != 0) {
			if(h == "undefiend") {
				showTime = "刚刚";
			}
			showTime = h + "小时前";
		} else if(d != 0) {
			if(d == "undefiend") {
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
		return timeStr
	}

	function updataTime() {
		let nowTime = new Date().getTime();
		let timeAdd = nowTime - initTime;
		$(".time").each(function(index, item) {
			let lefTime = parseInt(item.getAttribute("data-loadTime")) + parseInt(timeAdd);
			let showTime = countdown(lefTime);
			item.innerHTML = showTime;
		})
	}
});

//弹出框
var autoMask = setTimeout(mask, 3000);

function mask(num) {
	$("#mask").show();
	$(".content").addClass("maskAni");
	if(num == 2) {
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

function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); //定义正则表达式 
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return decodeURIComponent(r[2]);
	return null;
};