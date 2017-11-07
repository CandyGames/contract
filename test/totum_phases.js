//ICO hardCap 15000000 * 5 / 100 + 15000000 * 7 / 100 + hardCap = 15000000
//750000 + 1050000 + hardCap = 15000000
// hardCap = 13200000;

var totum = artifacts.require("./Totum.sol");
var totumPhases = artifacts.require("./TotumPhases.sol");
var totumAllocation = artifacts.require("./TotumAllocation.sol");

var Utils = require("./utils"),
    BigNumber = require('bignumber.js');

var precision = 100,
    now = parseInt(new Date().getTime() / 1000),
    bountyAddress = web3.eth.accounts[5],
    teamAddress = web3.eth.accounts[6],
    preICOAddress = web3.eth.accounts[7],
    icoAddress = web3.eth.accounts[8],
    icoAddress1 = web3.eth.accounts[9];

contract('TotumPhases', function (accounts) {
    let token, allocation;

    beforeEach(async function () {
        token = await totum.new(
            new BigNumber(15000000).mul(precision),
            'TOTUM',
            'TOTUM',
            2,
            false
        )
        allocation = await totumAllocation.new(
            bountyAddress,
            teamAddress,
            preICOAddress,
            icoAddress,
            icoAddress1
        )
    });

    it('deploy contract & check constructor data', async function () {

        let phases = await totumPhases.new(
            token.address,
            new BigNumber(10).mul(precision),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 1,
            now + 3600 * 24 * 1,
            new BigNumber(1000000).mul(precision),
            new BigNumber(13200000).mul(precision),
            now + 3600 * 24 * 2,
            now + 3600 * 24 * 3
        )

        await Utils.getPhase(phases, 0)
            .then((phase) => Utils.checkPhase(
                phase,
                new BigNumber(3300000000000000),
                new BigNumber(10).mul(precision),
                0,
                new BigNumber(500000).mul(precision),
                now - 3600 * 24 * 1,
                now + 3600 * 24 * 1,
                false
            ))

        await Utils.getPhase(phases, 1)
            .then((phase) => Utils.checkPhase(
                phase,
                new BigNumber(3300000000000000),
                new BigNumber(10).mul(precision),
                new BigNumber(1000000).mul(precision),
                new BigNumber(13200000).mul(precision),
                now + 3600 * 24 * 2,
                now + 3600 * 24 * 3,
                false
            ))

        let checkBounty = await allocation.bountyAddress.call()
        assert.equal(checkBounty.valueOf(), bountyAddress, 'bountyAddress is not equal')

        let checkTeam = await allocation.teamAddress.call()
        assert.equal(checkTeam.valueOf(), teamAddress, 'teamAddress is not equal')

        let checkPreICO = await allocation.preICOAddress.call()
        assert.equal(checkPreICO.valueOf(), preICOAddress, 'preICOAddress is not equal')

        let checkICO = await allocation.icoAddress.call()
        assert.equal(checkICO.valueOf(), icoAddress, 'icoAddress is not equal')

        let checkICO1 = await allocation.icoAddress1.call()
        assert.equal(checkICO1.valueOf(), icoAddress1, 'icoAddress1 is not equal')

    });

    it("create contract & buy tokens preico & check bonus & check ethers", async function () {
        let phases = await totumPhases.new(
            token.address,
            new BigNumber(10).mul(precision),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 1,
            now + 3600 * 24 * 1,
            new BigNumber(1000000).mul(precision),
            new BigNumber(13200000).mul(precision),
            now + 3600 * 24 * 2,
            now + 3600 * 24 * 3
        )

        let preICOAddressBalance = Utils.getEtherBalance(preICOAddress);

        await token.addMinter(phases.address);

        await phases.setTotumAllocation(allocation.address)

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("45454").valueOf()))

        let collectedEthers = await phases.getBalanceContract()
        assert.equal(collectedEthers.valueOf(), "1000000000000000000", 'collectedEthers is not equal')

        //1000000000000000000 * 100 / 3300000000000000 = 30303.030303 | 30303.030303 * 50 / 100 = 15151.5151515 | 45454.5454545
        let soldTokens = await phases.getTokens()
        assert.equal(soldTokens.valueOf(), "45454", 'soldTokens is not equal')

        await Utils.checkEtherBalance(preICOAddress, new BigNumber("1000000000000000000").add(preICOAddressBalance))

    });

    it("create contract & buy tokens preico & check min invest", async function () {
        let phases = await totumPhases.new(
            token.address,
            new BigNumber(31000),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 1,
            now + 3600 * 24 * 1,
            new BigNumber(1000000).mul(precision),
            new BigNumber(13200000).mul(precision),
            now + 3600 * 24 * 2,
            now + 3600 * 24 * 3
        )

        let preICOAddressBalance = Utils.getEtherBalance(preICOAddress);

        await token.addMinter(phases.address);

        await phases.setTotumAllocation(allocation.address)

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(Utils.receiptShouldFailed)
            .catch(Utils.catchReceiptShouldFailed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("0").valueOf()))

        let collectedEthers = await phases.getBalanceContract()
        assert.equal(collectedEthers.valueOf(), "0", 'collectedEthers is not equal')

        let soldTokens = await phases.getTokens()
        assert.equal(soldTokens.valueOf(), "0", 'soldTokens is not equal')

        await Utils.checkEtherBalance(preICOAddress, preICOAddressBalance)

        await phases.sendTransaction({value: "2000000000000000000"})
            .then(Utils.receiptShouldSucceed)
    });

    it("create contract & buy tokens ico & check bonus for first period & check ethers", async function () {
        let phases = await totumPhases.new(
            token.address,
            new BigNumber(10).mul(precision),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 13,
            now - 3600 * 24 * 12,
            new BigNumber(50000),
            new BigNumber(13200000).mul(precision),
            now - 3600 * 24 * 10,
            now + 3600 * 24 * 30
        )

        let icoAddressBalance = Utils.getEtherBalance(icoAddress),
            icoAddress1Balance = Utils.getEtherBalance(icoAddress1);

        await token.addMinter(phases.address);

        await phases.setTotumAllocation(allocation.address)

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("36363").valueOf()))

        let collectedEthers = await phases.getBalanceContract()
        assert.equal(collectedEthers.valueOf(), "1000000000000000000", 'collectedEthers is not equal')

        //1000000000000000000 * 100 / 3300000000000000 = 30303.030303 | 30303.030303 * 20 / 100 = 6060.6060606 | 36363.6363636
        let soldTokens = await phases.getTokens()
        assert.equal(soldTokens.valueOf(), "36363", 'soldTokens is not equal')

        await Utils.checkEtherBalance(icoAddress, new BigNumber("0").add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("0").add(icoAddress1Balance))

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("72726").valueOf()))

        await Utils.checkEtherBalance(icoAddress, new BigNumber("1000000000000000000").add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("1000000000000000000").add(icoAddress1Balance))
    });

    it("create contract & buy tokens ico & check bonus for second period & check ethers & check get... functions", async function () {
        let phases = await totumPhases.new(
            token.address,
            new BigNumber(10).mul(precision),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 23,
            now - 3600 * 24 * 22,
            new BigNumber(100000),
            new BigNumber(13200000).mul(precision),
            now - 3600 * 24 * 20,
            now + 3600 * 24 * 20
        )

        let icoAddressBalance = Utils.getEtherBalance(icoAddress),
            icoAddress1Balance = Utils.getEtherBalance(icoAddress1);

        await token.addMinter(phases.address);

        await phases.setTotumAllocation(allocation.address)

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("34848").valueOf()))
        //1000000000000000000 * 100 / 3300000000000000 = 30303.030303 | 30303.030303 * 15 / 100 = 4545.45454545 | 34848.4848484

        await Utils.checkEtherBalance(icoAddress, new BigNumber("0").add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("0").add(icoAddress1Balance))

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("69696").valueOf()))

        await Utils.checkEtherBalance(icoAddress, new BigNumber("0").add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("0").add(icoAddress1Balance))

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("104544").valueOf()))

        await Utils.checkEtherBalance(icoAddress, new BigNumber("1500000000000000000").add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("1500000000000000000").add(icoAddress1Balance))

        icoAddressBalance = Utils.getEtherBalance(icoAddress);
        icoAddress1Balance = Utils.getEtherBalance(icoAddress1);

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("139392").valueOf()))

        await Utils.checkEtherBalance(icoAddress, new BigNumber("500000000000000000").add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("500000000000000000").add(icoAddress1Balance))

        await phases.sendTransaction({value: "1000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("174240").valueOf()))

        await Utils.checkEtherBalance(icoAddress, new BigNumber("500000000000000000").mul(2).add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("500000000000000000").mul(2).add(icoAddress1Balance))

        await phases.sendTransaction({value: "1000000000000000000", from: accounts[1]})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[1], new BigNumber("34848").valueOf()))

        await Utils.checkEtherBalance(icoAddress, new BigNumber("500000000000000000").mul(3).add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("500000000000000000").mul(3).add(icoAddress1Balance))

        let investorsCount = await phases.getAllInvestors()
        assert.equal(investorsCount.valueOf(), "2", 'investorsCount is not equal')

        let getTokens = await phases.getTokens()
        assert.equal(getTokens.valueOf(), "209088", 'getTokens is not equal')

        let soldTokens = await phases.getSoldToken()
        assert.equal(soldTokens.valueOf(), "209088", 'getSoldToken is not equal')

        let balanceContract = await phases.getBalanceContract()
        assert.equal(balanceContract.valueOf(), "6000000000000000000", 'balanceContract is not equal')
    });

    it("create contract & check SendTo... functions, setCurrentRate", async function () {
        let phases = await totumPhases.new(
            token.address,
            new BigNumber(10).mul(precision),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 1,
            now + 3600 * 24 * 1,
            new BigNumber(1000000).mul(precision),
            new BigNumber(13200000).mul(precision),
            now + 3600 * 24 * 2,
            now + 3600 * 24 * 10
        )

        await token.addMinter(phases.address);

        await phases.setTotumAllocation(allocation.address)

        await phases.sendToAddress(accounts[1], 10000)
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[1], new BigNumber("15000").valueOf()))

        await phases.sendToAddressWithTime(accounts[2], 10000, now + 3600 * 24 * 3)
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[2], new BigNumber("12000").valueOf()))

        await phases.sendToAddressWithBonus(accounts[3], 10000, 18000)
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[3], new BigNumber("28000").valueOf()))

        await phases.setCurrentRate(new BigNumber(3400000000000000))

        await Utils.getPhase(phases, 0)
            .then((phase) => Utils.checkPhase(
                phase,
                new BigNumber(3400000000000000),
                new BigNumber(10).mul(precision),
                0,
                new BigNumber(500000).mul(precision),
                now - 3600 * 24 * 1,
                now + 3600 * 24 * 1,
                false
            ))

        await Utils.getPhase(phases, 1)
            .then((phase) => Utils.checkPhase(
                phase,
                new BigNumber(3400000000000000),
                new BigNumber(10).mul(precision),
                new BigNumber(1000000).mul(precision),
                new BigNumber(13200000).mul(precision),
                now + 3600 * 24 * 2,
                now + 3600 * 24 * 10,
                false
            ))

        await phases.setPhase(
            0,
            now - 3600 * 24 * 20,
            now - 3600 * 24 * 10,
            new BigNumber(3300000000000000),
            new BigNumber(0),
            new BigNumber(500028).mul(precision),
        )
            .then(Utils.receiptShouldSucceed)

        await Utils.getPhase(phases, 0)
            .then((phase) => Utils.checkPhase(
                phase,
                new BigNumber(3300000000000000),
                new BigNumber(10).mul(precision),
                0,
                new BigNumber(500028).mul(precision),
                now - 3600 * 24 * 20,
                now - 3600 * 24 * 10,
                false
            ))

        await phases.setTotum(token.address)
    });

    it("create contract & check isSucceed, isFinished, bounty, teams", async function () {
        let phases = await totumPhases.new(
            token.address,
            new BigNumber(10).mul(precision),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 23,
            now - 3600 * 24 * 22,
            new BigNumber(1000000).mul(precision),
            new BigNumber(13200000).mul(precision),
            now - 3600 * 24 * 21,
            now + 3600
        )

        let icoAddressBalance = Utils.getEtherBalance(icoAddress),
            icoAddress1Balance = Utils.getEtherBalance(icoAddress1),
            account1Balance = Utils.getEtherBalance(accounts[1]);

        await token.addMinter(phases.address);

        await phases.setTotumAllocation(allocation.address)

        await phases.sendTransaction({value: "1000000000000000000", from: accounts[1]})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[1], new BigNumber("33333").valueOf()))
        //1000000000000000000 * 100 / 3300000000000000 = 30303.030303 | 30303.030303 * 10 / 100 = 3030.3030303 | 33333.3333333

        console.log('amount', 1000000000000000000);
        console.log('account1Balance before transaction', account1Balance.valueOf());
        console.log('account1Balance after transaction0', Utils.getEtherBalance(accounts[1]).valueOf());

        let isSucceed = await phases.isSucceed.call(0)
        assert.equal(isSucceed.valueOf(), true, 'isSucceed is not equal')

        let isFinished = await phases.isFinished.call(0)
        assert.equal(isFinished.valueOf(), true, 'isFinished is not equal')

        isSucceed = await phases.isSucceed.call(1)
        assert.equal(isSucceed.valueOf(), false, 'isSucceed is not equal')

        isFinished = await phases.isFinished.call(1)
        assert.equal(isFinished.valueOf(), false, 'isFinished is not equal')

        await phases.setPhase(
            1,
            now - 3600 * 24 * 20,
            now - 5,
            new BigNumber(3283559600000000),
            new BigNumber(20000),
            new BigNumber(9800000).mul(precision),
        )
            .then(Utils.receiptShouldSucceed)

        isSucceed = await phases.isSucceed.call(1)
        assert.equal(isSucceed.valueOf(), true, 'isSucceed is not equal')

        await phases.isSucceed(1)
            .then(Utils.receiptShouldSucceed)

        await Utils.balanceShouldEqualTo(token, bountyAddress, new BigNumber("750000").mul(precision).valueOf())
        await Utils.balanceShouldEqualTo(token, teamAddress, new BigNumber("1050000").mul(precision).valueOf())

        await Utils.checkEtherBalance(icoAddress, icoAddressBalance)
        await Utils.checkEtherBalance(icoAddress1, icoAddress1Balance)

        await phases.isSucceed(1)
            .then(Utils.receiptShouldSucceed)

        await Utils.balanceShouldEqualTo(token, bountyAddress, new BigNumber("750000").mul(precision).valueOf())
        await Utils.balanceShouldEqualTo(token, teamAddress, new BigNumber("1050000").mul(precision).valueOf())

        await Utils.checkEtherBalance(icoAddress, icoAddressBalance)
        await Utils.checkEtherBalance(icoAddress1, icoAddress1Balance)

    });

    it("create contract & check refund", async function () {
        let phases = await totumPhases.new(
            token.address,
            new BigNumber(10).mul(precision),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 23,
            now - 3600 * 24 * 22,
            new BigNumber(1000000).mul(precision),
            new BigNumber(13200000).mul(precision),
            now - 3600 * 24 * 21,
            now + 3600
        )

        let icoAddressBalance = Utils.getEtherBalance(icoAddress),
            icoAddress1Balance = Utils.getEtherBalance(icoAddress1),
            account1Balance = Utils.getEtherBalance(accounts[1]);

        await token.addMinter(phases.address);

        await phases.setTotumAllocation(allocation.address)

        await phases.sendTransaction({value: "1000000000000000000", from: accounts[1]})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[1], new BigNumber("33333").valueOf()))
        //1000000000000000000 * 100 / 3300000000000000 = 30303.030303 | 30303.030303 * 10 / 100 = 3030.3030303 | 33333.3333333

        console.log('amount', 1000000000000000000);
        console.log('account1Balance before transaction', account1Balance.valueOf());
        console.log('account1Balance after transaction0', Utils.getEtherBalance(accounts[1]).valueOf());

        await phases.setPhase(
            1,
            now - 3600 * 24 * 20,
            now - 3600,
            new BigNumber(3300000000000000),
            new BigNumber(1000000).mul(precision),
            new BigNumber(13200000).mul(precision),
        )
            .then(Utils.receiptShouldSucceed)

        await phases.refund({from: accounts[1]})
            .then(() => Utils.receiptShouldSucceed)

        console.log('account1Balance after refund000000', Utils.getEtherBalance(accounts[1]).valueOf());

        await Utils.balanceShouldEqualTo(token, accounts[1], new BigNumber("0").valueOf())
    });

    it("create contract & check Volume-based bonus", async function () {
        let phases = await totumPhases.new(
            token.address,
            new BigNumber(10).mul(precision),
            new BigNumber(3300000000000000),
            new BigNumber(500000).mul(precision),
            now - 3600 * 24 * 13,
            now + 3600 * 24 * 12,
            new BigNumber(1000000).mul(precision),
            new BigNumber(13200000).mul(precision),
            now + 3600 * 24 * 13,
            now + 3600 * 24 * 30
        )

        let preICOAddressBalance = Utils.getEtherBalance(preICOAddress),
            icoAddressBalance = Utils.getEtherBalance(icoAddress),
            icoAddress1Balance = Utils.getEtherBalance(icoAddress1);

        await token.addMinter(phases.address);

        await phases.setTotumAllocation(allocation.address)

        await phases.sendTransaction({value: "3000000000000000000"})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[0], new BigNumber("136363").valueOf()))
        //3000000000000000000 * 100 / 3300000000000000 = 90909.0909090909090909 | 90909.0909090909090909 * 50 / 100 = 45454.54545454545454545 | 136363.63636363636363635

        let soldTokens = await phases.getTokens()
        assert.equal(soldTokens.valueOf(), "136363", 'soldTokens is not equal')

        await Utils.checkEtherBalance(preICOAddress, new BigNumber("3000000000000000000").add(preICOAddressBalance))
        await Utils.checkEtherBalance(icoAddress, icoAddressBalance)
        await Utils.checkEtherBalance(icoAddress1, icoAddress1Balance)

        await phases.setPhase(
            0,
            now - 3600 * 24 * 29,
            now - 3600 * 24 * 20,
            new BigNumber(3300000000000000),
            0,
            new BigNumber(9800000).mul(precision),
        )
            .then(Utils.receiptShouldSucceed)

        await phases.setPhase(
            1,
            now - 3600 * 24 * 10,
            now + 3600,
            new BigNumber(3300000000000000),
            new BigNumber(250000),
            new BigNumber(13200000).mul(precision),
        )
            .then(Utils.receiptShouldSucceed)

        await phases.sendTransaction({value: "2999999999999999999", from: accounts[1]})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[1], new BigNumber("109090").valueOf()))
        //2999999999999999999 * 100 / 3300000000000000 * 12/10 = 109090.9090909090908727

        soldTokens = await phases.getTokens()
        assert.equal(soldTokens.valueOf(), "245453", 'soldTokens is not equal')

        await Utils.checkEtherBalance(icoAddress, icoAddressBalance)
        await Utils.checkEtherBalance(icoAddress1, icoAddress1Balance)

        await phases.sendTransaction({value: "14999999999999999999", from: accounts[2]})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[2], new BigNumber("559090").valueOf()))
        //14999999999999999999 * 100 / 3300000000000000 * 123/100 = 559090.9090909090908718

        soldTokens = await phases.getTokens()
        assert.equal(soldTokens.valueOf(), "804543", 'soldTokens is not equal')

        await Utils.checkEtherBalance(icoAddress, new BigNumber("8999999999999999999").add(icoAddressBalance))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("8999999999999999999").add(icoAddress1Balance))

        await phases.sendTransaction({value: "29999999999999999999", from: accounts[3]})
            .then(() => Utils.receiptShouldSucceed)
            .then(() => Utils.balanceShouldEqualTo(token, accounts[3], new BigNumber("1136362").valueOf()))
        //29999999999999999999 * 100 / 3300000000000000 * 125/100 = 1136363.6363636363635985

        soldTokens = await phases.getTokens()
        assert.equal(soldTokens.valueOf(), "1940905", 'soldTokens is not equal')

        await Utils.checkEtherBalance(icoAddress, new BigNumber("8999999999999999999").add(icoAddressBalance).add('14999999999999999999'))
        await Utils.checkEtherBalance(icoAddress1, new BigNumber("8999999999999999999").add(icoAddress1Balance).add('15000000000000000000'))


    });
});