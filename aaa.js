myApp.controller('itemCtrl', ['$scope', '$http', '$timeout', '$rootScope', function(scope, http, timeout, rootScope) {
    scope.goodId = myCommon.getQueryString('id');
    scope.channelId = '3';
    scope.minCount = 0;
    scope.submitCount = 1;
    scope.showFileIntroLayer = false;

    var myDate = new Date();
    myDate = new Date(myDate.setDate(myDate.getDate() + 2));
    scope.data = (myDate.getMonth() + 1) + "月" + myDate.getDate() + "日";
    // 添加用户足记
    myCommon.ajax(http, {
        type: 'post',
        url: window.apiJavaServer + '/search/addSuggest',
        data: {
            goodsId: scope.goodId
        }
    });
    // 货品SPU
    myCommon.ajax(http, {
        type: 'get',
        url: window.apiServer + '/api/product/showItem/' + scope.goodId,
        success: function(data) {
            var goodsList = data.data[1];
            scope.goods = myCommon.getItem(goodsList, scope.goodId, 'id');
            scope.description = data.data[2].description;
            if (scope.goods.cat_id == 2490) {
                // 名片商品
                scope.isCard = true;
                scope.minCount = scope.goods.good_ladder_price[0].num;
                scope.initPenson();
            } else {
                // 非名片商品
                scope.isCard = false;
            }
            scope.spuSpecList = [];
            var allSpecList = data.data[0];
            if (allSpecList) { //整合spu属性分类
                for (var i = 0; i < allSpecList.length; i++) {
                    var item = allSpecList[i];
                    item.unit = allSpecList[i].unit;
                    item.checked = !!myCommon.getItem(scope.goods.spec_info, item.spec_option_id, 'spec_option_id');
                    item.goods_id = item.checked ? scope.goods.id : scope.getGoodsId(goodsList, item);
                    var spec = myCommon.getItem(scope.spuSpecList, item.spec_id, 'spec_id');
                    if (spec) {
                        spec.options.push(item);
                    } else {
                        scope.spuSpecList.push({
                            spec_id: item.spec_id,
                            spec_name: item.spec_name,
                            options: [item]
                        });
                    }
                }
            }
            // 价格
            scope.isCard ? scope.price() : scope.sellPrice = scope.goods.price;
        }
    });
    scope.getGoodsId = function(goodsList, spec) {
        var options = [spec]; //新商品组合
        for (var i = 0; i < scope.goods.spec_info.length; i++) {
            var item = scope.goods.spec_info[i];
            if (item.spec_id !== spec.spec_id) {
                options.push(item);
            }
        }
        var goodsId = 0;
        for (var i = 0; i < goodsList.length; i++) {
            var item = goodsList[i];
            if (item.spec_info.length != options.length) {
                continue;
            }
            var isExist = true;
            for (var j = 0; j < options.length; j++) {
                if (!myCommon.getItem(item.spec_info, options[j].spec_option_id, 'spec_option_id')) {
                    isExist = false;
                    break;
                }
            }
            if (isExist) { //&&item.amount == 0库存为零不可选
                goodsId = item.id;
                break;
            }
        }
        return goodsId;
    };
    scope.directItem = function(spec) {
        if (spec.checked || spec.goods_id == 0) {
            return false;
        }
        location.href = "/yinwu/item?id=" + spec.goods_id;
    };
    // 人员数量
    scope.single = true;
    scope.showPersonOption = false;
    scope.showNumOption = false;
    scope.initPenson = function() {
        scope.nameCount = [{ name: "-", count: scope.minCount }];
        scope.nameCounts = [{
            name: "",
            count: scope.minCount,
            isShowOpt: false
        }, {
            name: "",
            count: scope.minCount,
            isShowOpt: false
        }];
    };

    // 单人
    scope.danren = function() {
        scope.single = true;
        scope.price();
    };
    scope.singleNum = function(item) {
        _czc.push(['_trackEvent', '名片商品详情页订购数量-单人盒数-' + item.num + '盒', '订购数量选择变化']);
        scope.nameCount[0].count = item.num;
        scope.price();
    };
    // 多人
    scope.duoren = function() {
        scope.single = false;
        scope.price();
    };
    scope.duorenNum = function(count, item, idx) {
        _czc.push(['_trackEvent', '名片商品详情页订购数量-多人第' + (idx + 1) + '行盒数-' + item.num + '盒', '订购数量选择变化']);
        count.count = item.num;
        scope.price();
    };
    // 添加人数
    scope.addPerson = function() {
        _czc.push(['_trackEvent', '名片商品详情页订单数量增加人数按钮', '订购数量选择变化']);
        scope.nameCounts.push({
            name: "",
            count: scope.minCount,
            isShowOpt: false
        });
        scope.price();
    };
    // 删除
    scope.delPerson = function(index) {
        if (scope.nameCounts.length == 1) {
            scope.danren();
            return;
        };
        scope.nameCounts.splice(index, 1);
        scope.price();
    };

    scope.checkCount = function() {
        if (scope.submitCount > scope.goods.amount) {
            myCommon.showMessage("商品库存不足,我们会尽快补货");
            scope.submitCount = scope.goods.amount;
            return;
        }
        if (scope.submitCount > 1000) {
            myCommon.showMessage("单个商品一次最多购买1000件");
            scope.submitCount = 1000;
            return;
        }
        if (parseInt(scope.submitCount) == 0) {
            scope.submitCount = 1;
        }
    }

    scope.countBlur = function() {
        if (!scope.submitCount) {
            scope.submitCount = 1;
        }
    }

    scope.minus = function() {
        if (scope.submitCount == 1) {
            return
        }
        scope.submitCount--;
    }

    scope.plus = function() {
        scope.submitCount++;
        if (scope.submitCount > scope.goods.amount) {
            scope.submitCount = scope.goods.amount;
            myCommon.showMessage("商品库存不足,我们会尽快补货");
            return;
        }
        if (scope.submitCount > 1000) {
            scope.submitCount = 1000;
            myCommon.showMessage("单个商品一次最多购买1000件");
            return;
        }
    }

    // 加入购物车
    scope.addToCart = function() {
        // if (!myValidator.validateAll()) {
        //     return false;
        // }
        if (!scope.single) {
            for (var i = 0; i < scope.nameCounts.length; i++) {
                delete scope.nameCounts[i].isShowOpt;
                if (scope.nameCounts[i].name == "") {
                    scope.nameCounts[i].name = "-";
                }
            }
        }
        myCommon.ajax(http, {
            type: 'post',
            data: {
                goods_id: scope.goodId,
                name_count: scope.single ? JSON.stringify(scope.nameCount) : JSON.stringify(scope.nameCounts),
                custom_files: JSON.stringify(scope.customFiles),
                goods_type: 1
            },
            url: window.apiServer + '/api/yinwu/shopcart',
            success: function(data) {
                // window.location.href = "/yinwu/cart";
                setYinwuCarShopCount();
                flyToCart();
            }
        });
    };
    // 非名片商品加入购物车
    scope.addToCartOther = function() {
        var nameCountOther = [{
            name: "-",
            count: scope.submitCount
        }];
        myCommon.ajax(http, {
            type: 'post',
            data: {
                goods_id: scope.goodId,
                name_count: JSON.stringify(nameCountOther),
                custom_files: JSON.stringify(scope.customFiles),
                goods_type: 3
            },
            url: window.apiServer + '/api/yinwu/shopcart',
            success: function(data) {
                // window.location.href = "/yinwu/cart";
                setYinwuCarShopCount();
                flyToCart();
            }
        });
    }

    // 飞入购物车动画
    function flyToCart() {
        $('<div class="addshopcar"></div>').fly({
            start: {
                top: $(".cart-btn").position().top - $(document).scrollTop() - 50,
                left: $(".cart-btn").position().left + 70
            },
            end: {
                top: $(".my-header .cart").position().top + 80,
                left: $(".my-header .cart").position().left,
                width: 20,
                height: 20
            },
            onEnd: function() {
                this.destroy();
            }
        });
    }

    scope.hideOpt = function() {
        scope.showPersonOption = false;
        scope.showNumOption = false;
        if (!scope.single) {
            for (var i = 0; i < scope.nameCounts.length; i++) {
                scope.nameCounts[i].isShowOpt = false;
            }
        }
    };
    scope.hideOpts = function(index) {
        scope.showPersonOption = false;
        scope.showNumOption = false;
        if (!scope.single) {
            for (var i = 0; i < scope.nameCounts.length; i++) {
                scope.nameCounts[i].isShowOpt = false;
            }
            scope.nameCounts[index].isShowOpt = true;

        }
    };
    // 价格
    scope.price = function() {
        scope.totleCount = 0;
        scope.sellPrice = 0;
        scope.totalPrice = 0;
        if (scope.single) {
            for (var i = 0; i < scope.goods.good_ladder_price.length; i++) {
                if (scope.goods.good_ladder_price[i].num == scope.nameCount[0].count) {
                    scope.sellPrice = scope.goods.good_ladder_price[i].selling_price;
                    scope.totalPrice = scope.goods.good_ladder_price[i].selling_total_price;
                };
            };
        } else {
            for (var i = 0; i < scope.goods.good_ladder_price.length; i++) {
                for (var j = 0; j < scope.nameCounts.length; j++) {
                    if (scope.goods.good_ladder_price[i].num == scope.nameCounts[j].count) {
                        scope.totleCount += scope.goods.good_ladder_price[i].num * 1;
                        scope.totalPrice += scope.goods.good_ladder_price[i].selling_total_price * 1;
                    };
                }
            };
            scope.sellPrice = scope.totalPrice / scope.totleCount;
        };

    };

    scope.dataRecordRow = function(idx) {
        _czc.push(['_trackEvent', '名片商品详情页订购数量-多人第' + (idx + 1) + '行', '订购数量选择变化']);
    }

    // 文件上传
    // 已加入队列文件
    scope.customFiles = [];
    scope.showLoading = false;
    scope.percentage = 0;
    var uploader = WebUploader.create({
        swf: window.libServer + '/webuploader/Uploader.swf',
        server: window.apiServer + '/api/yinwu/upload',
        pick: '.upload-btn',
        auto: true, //自动上传
        resize: false, //上传前压缩
        multiple: false, //上传一张
        duplicate: true, //重复上传
        // fileSizeLimit: 10000000, //10M
        fileSingleSizeLimit: 20000000, //单个文件20M
        accept: {
            title: 'excl',
            extensions: 'bmp,jpg,JPEG,png,tiff,gif,pcx,tga,exif,fpx,svg,psd,cdr,pcd,dxf,ufo,eps,ai,raw,WMF,ppt,doc,xlsx,xls,pdf,rar,zip,7z',
            mimeTypes: ''
        }
    });
    // mimeTypes: 'image/*,image/x-olympus-orf,application/postscript,application/x-msmetafile,application/vnd.ms-powerpoint,application/msword,application/vnd.ms-excel,application/pdf,application/zip,application/x-7z-compressed,application/rar'

    if (!WebUploader.Uploader.support()) {
        myCommon.showMessage("您的浏览器尚未安装Flash插件，无法使用，需安装后重新启动浏览器。 或更换谷歌、火狐、IE9以上浏览器使用。");
        return;
    };

    uploader.on('uploadBeforeSend', function(obj, data, headers) {
        var token = myCommon.getLocalStorage('token');
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
    });
    // 上传成功
    uploader.on('uploadSuccess', function(file, response) {
        if (response.code == 200) {
            scope.listFiles = uploader.getFiles('complete');
            scope.customFiles.push(response.data.path);
            scope.$apply();
        } else {
            myCommon.showMessage(response.info || '上传失败');
            uploader.removeFile(file);
        };
    });
    // 上传出错
    uploader.on('uploadError', function(file, reason) {
        uploader.removeFile(file, true);
        if (reason == 401) {
            location.href = window.loginUrl;
        };
    });
    // 上传进度
    uploader.on('uploadStart', function(file, percentage) {
        scope.showLoading = true;
        scope.$apply();
    });
    uploader.on('uploadProgress', function(file, percentage) {
        scope.percentage = percentage;
        if (scope.percentage == 1) {
            scope.showLoading = false;
        }
        scope.$apply();
    });

    uploader.on('error', function(reason) {
        var msg = '上传失败';
        switch (reason) {
            case 'F_DUPLICATE':
                msg = '文件上传重复';
                break;
            case 'Q_EXCEED_NUM_LIMIT':
                msg = '上传文件数量超出了限制';
                break;
            case 'F_EXCEED_SIZE':
                msg = '文件大小超出限制，单次最大支持20M.';
                break;
            case 'Q_EXCEED_SIZE_LIMIT':
                msg = 'aaaaa.';
                break;
            case 'Q_TYPE_DENIED':
                msg = '文件类型不符合要求';
                break;
        }
        myCommon.showMessage(msg);
    });
    // 删除队列中的文件
    scope.delFile = function(file) {
        for (var i = 0; i < scope.customFiles.length; i++) {
            if (scope.customFiles[i].indexOf(file.name) != -1) {
                scope.customFiles.splice(i, 1);
                break;
            };
        };
        uploader.removeFile(file, true);
        scope.listFiles = uploader.getFiles('complete');
    };

    // 商品详情
    $(".fix-btn").hide();
    $(window).scroll(function() {
        if ($(window).scrollTop() > 780) {
            if ($(".shop-title").hasClass("shop-title-fix")) {
                return;
            }
            $(".shop-title").addClass("shop-title-fix");
            $(".fix-btn").show();

        } else {
            $(".shop-title").removeClass("shop-title-fix");
            $(".fix-btn").hide();
        }
    });


    // 图片预览
    scope.checkImg = function(img, idx) {
        _czc.push(['_trackEvent', '名片商品详情页左侧主图下缩略图-' + (idx + 1), '主图框变化']);
        scope.goods.download_url = img.absolute_path;
    };
    // 轮播 暂时不用
    // timeout(function() {
    //     var viewSwiper = new Swiper('.view .swiper-container', {
    //         onSlideChangeStart: function() {
    //             updateNavPosition();
    //         }
    //     });

    //     $('.view .arrow-left,.preview .arrow-left').on('click', function(e) {
    //         e.preventDefault();
    //         if (viewSwiper.activeIndex == 0) {
    //             viewSwiper.slideTo(viewSwiper.slides.length - 1, 1000);
    //             return;
    //         }
    //         viewSwiper.slidePrev();
    //     })
    //     $('.view .arrow-right,.preview .arrow-right').on('click', function(e) {
    //         e.preventDefault();
    //         if (viewSwiper.activeIndex == viewSwiper.slides.length - 1) {
    //             viewSwiper.slideTo(0, 1000);
    //             return
    //         }
    //         viewSwiper.slideNext();
    //     })

    //     var previewSwiper = new Swiper('.preview .swiper-container', {
    //         visibilityFullFit: true,
    //         slidesPerView: 'auto',
    //         onlyExternal: true,
    //         onSlideClick: function() {
    //             viewSwiper.slideTo(previewSwiper.clickedSlideIndex);
    //         }
    //     })

    //     function updateNavPosition() {
    //         $('.preview .active-nav').removeClass('active-nav');
    //         var activeNav = $('.preview .swiper-slide').eq(viewSwiper.activeIndex).addClass('active-nav');
    //         if (!activeNav.hasClass('swiper-slide-visible')) {
    //             if (activeNav.index() > previewSwiper.activeIndex) {
    //                 var thumbsPerNav = Math.floor(previewSwiper.width / activeNav.width()) - 1;
    //                 previewSwiper.slideTo(activeNav.index() - thumbsPerNav);
    //             } else {
    //                 previewSwiper.slideTo(activeNav.index());
    //             }
    //         }
    //     }
    // }, 1000);

}]);