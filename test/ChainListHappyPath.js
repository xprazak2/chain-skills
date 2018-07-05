var ChainList = artifacts.require('./ChainList.sol');

contract('ChainList', function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName1 = "article 1";
  var articleDescription1 = "Description";
  var articlePrice1 = 10;
  var articleName2 = "article 2";
  var articleDescription2 = "Description 2";
  var articlePrice2 = 20;
  var sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
  var buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

  it('should be initialized wiht empty values', function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return instance.getNumberOfArticles()
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "number of articles must be zero");
      return chainListInstance.getArticlesForSale();
    }).then(function(data) {
      var len = Array.from(data).length
      assert.equal(len, 0, "there should be no articles for sale");
    });
  });

  it("should let us sell first article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName1,
                                           articleDescription1,
                                           web3.toWei(articlePrice1, "ether"),
                                           { from: seller });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller)
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id must be 1");
      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data, 1, "Number of articles must be one");

      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 1, "there must be one article for sale");
      assert.equal(data[0].toNumber(), 1, "article id must be one");

      return chainListInstance.articles(data[0]);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id must be one");
      assert.equal(data[1], seller, "seller mus be seller");
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName1, "name should be " + articleName1);
    })
  })

  it("should let us sell second article", function(){
    return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName2,
                                           articleDescription2,
                                           web3.toWei(articlePrice2, "ether"),
                                           { from: seller });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "one event should have been triggered");
      assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be LogSellArticle");
      assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller)
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "id must be 2");
      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data, 2, "Number of articles must be two");

      return chainListInstance.getArticlesForSale();
    }).then(function(data){
      assert.equal(data.length, 2, "there must be two article for sale");
      assert.equal(data[1].toNumber(), 2, "article id must be one");

      return chainListInstance.articles(data[1]);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 2, "article id must be two");
      assert.equal(data[1], seller, "seller mus be seller");
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName2, "name should be " + articleName2);
    })
  })

  it("should buy first article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
      buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

      return chainListInstance.buyArticle(1,
        { from: buyer,
          value: web3.toWei(articlePrice1, "ether")})
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "one event should have been triggered");
        assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be LogBuyArticle");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "id should be one");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller);
        assert.equal(receipt.logs[0].args._buyer, buyer, "event seller should be " + buyer);
        assert.equal(receipt.logs[0].args._name, articleName1, "event name should be " + articleName1);
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, "ether"), "event price should be " + articlePrice1);

        sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
        buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

        assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + articlePrice1, "seller should have earned article price")
        assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice1, "buyer should have spent article price")
        return chainListInstance.getArticlesForSale();
      }).then(function(data) {
        var len = Array.from(data).length
        assert.equal(len, 1, "there should be one article left for sale");
        assert.equal(data[0].toNumber(), 2, "article 2 should be for sale");

        return chainListInstance.getNumberOfArticles();
      }).then(function(data) {
        assert.equal(data.toNumber(), 2, "there should be 2 articles in total");
      })
    })
  })
});
