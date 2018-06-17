var ChainList = artifacts.require('./ChainList.sol');

contract('ChainList', function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var articleName = "article 1";
  var articleDescription = "Description";
  var articlePrice = 10;

  it('should be initialized wiht empty values', function() {
    return ChainList.deployed().then(function(instance) {
      return instance.getArticle()
    }).then(function(data) {
      assert.equal(data[0], 0x0, "seller must be empty");
      assert.equal(data[1], "", "name must be empty");
      assert.equal(data[2], "", "description must be empty");
      assert.equal(data[3].toNumber(), 0, "price must be zero");
    });
  });

  it("should sell an article", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName,
        articleDescription, web3.toWei(articlePrice, "ether"),
        { from: seller });
    }).then(function() {
      return chainListInstance.getArticle();
    }).then(function(data) {
      assert.equal(data[0], seller, "seller must be seller");
      assert.equal(data[1], articleName, "name must not be empty");
      assert.equal(data[2], articleDescription, "description must not be empty");
      assert.equal(data[3].toNumber(), web3.toWei(articlePrice, "ether"), "price must not be zero");
    });
  })
});
