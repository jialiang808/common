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

    window.obj = new MVVM(model);
});
for (var i = 0; i < 5; i++) {
    (function(i) {
        console.log(i);
    })(i);
}
// setTimeout(function() {
//     console.log('setTimeout---');
// }, 0);
// new Promise(function(resolve, reject) {
//     console.log('Promise start---');
//     for (var i = 0; i < 10000; i++) {
//         var a = i;
//     }
//     resolve();
//     // reject();
//     console.log('Promise end---');
// }).then(function(result) {
//     console.log('Promise then---');
// }).catch(function(reason) {
//     console.log('Promise catch---');
// });
// console.log('main---');

// var a = {
//     b: function() {
//         console.log(this);
//         setTimeout(() => {
//             console.log(this);
//         }, 100)
//     }
// };

// a.b();