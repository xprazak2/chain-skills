var ChainList = artifacts.require('./ChainList.sol');

contract("ChainList", function(accounts) {
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "article 1"
  var articleDescription = "article 1 desc"
  var articlePrice = 10;

  it("should thow an exception when no article for sale", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {
        from: buyer,
        value: web3.toWei(articlePrice, 'ether')
      });
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function(){
      return chainListInstance.getNumberOfArticles();
    }).then(function(data){
      assert.equal(data.toNumber(), 0, "num of articles must be zero");
    })
  })

  it('should thow when buying an article that does not exist', function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName,
                                           articleDescription,
                                           web3.toWei(articlePrice, "ether"),
                                           { from: seller });
    }).then(function(receipt){
      return chainListInstance.buyArticle(2,
        {from: seller, value: web3.toWei(articlePrice, 'ether')})
    }).then(assert.fail).catch(function(error){
      assert(true)
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id should be 1")
    });
  })

  it('should throw an exception if you buy your own article', function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;

      return chainListInstance.buyArticle(1, { from: seller, value: web3.toWei(articlePrice, 'ether')});
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be seller");
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "name must be should be " + articleName);
      assert.equal(data[4], articleDescription, "description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), "price must be 10");
    })
  })

  it('should throw an exception if you buy for incorrect price', function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, { from: buyer, value: web3.toWei(5, 'ether')});
    }).then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be seller");
      assert.equal(data[2], 0x0, "buyer must be empty");
      assert.equal(data[3], articleName, "name must be should be " + articleName);
      assert.equal(data[4], articleDescription, "description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), "price must be 10");
    })
  })

  it('should throw an exception if you buy something that has been sold', function(){
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, { from: buyer, value: web3.toWei(articlePrice, 'ether')});
    }).then(function(){
      return chainListInstance.buyArticle(1, { from: web3.eth.accounts[0], value: web3.toWei(articlePrice, 'ether')});
    })
    .then(assert.fail)
    .catch(function(err) {
      assert(true);
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1, "article id must be 1");
      assert.equal(data[1], seller, "seller must be seller");
      assert.equal(data[2], buyer, "buyer must be buyer");
      assert.equal(data[3], articleName, "name must be should be " + articleName);
      assert.equal(data[4], articleDescription, "description must be " + articleDescription);
      assert.equal(data[5].toNumber(), web3.toWei(articlePrice, 'ether'), "price must be 10");
    })
  })
})