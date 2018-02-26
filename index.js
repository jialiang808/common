$(function() {
    var model = {
        el: '#listView',
        data: {
            lists: [],
            searchKey: '',
            id: '',
            giftStatus: -1,
            isShowToMall: false,
            showSearch: false
        },
        methods: {
            goodsClick: function(item) {
                console.log(item);
            },
            search: function() {
                console.log(this.searchKey);
            }
        },
        created: function() {
            this.lists = goodsList;
            this.isShowToMall = true;
        }
    };

    window.myVue = new Vue(model);
});