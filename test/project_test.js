const Token = artifacts.require("RE_Token")
const PreSale = artifacts.require("RE_PreSale")

const { expect, assert } = require("./setupchai.js")
const BN = web3.utils.BN

const {
  ether,
  getBalance,
  transferOwnership,
  makeTransaction,
} = require("./helpers.js")

require("dotenv").config({ path: "./.env" })

contract("Real Estate Project Test", async (accounts) => {
  const [investor, receiver, hacker_1, hacker_2] = accounts

  console.log("Investor: ", investor)
  console.log("Receiver: ", receiver)

  const investment = ether(10)
  const smallInvestment = ether(0.5)
  const hugeInvestment = ether(100)
  const softCap = ether(2500)
  const hardCap = ether(4000)
  const transfer = new BN(150000000000000)

  beforeEach(async () => {
    this.token = await Token.new()
    this.presale = await PreSale.new(5, investor, this.token.address)
    this.owner = await this.presale.owner.call()
  })

  describe("Ownership", async () => {
    it("should initially belong to contract caller", async () => {
      assert.equal(this.owner, investor)
    })
    it("should be transferable to another account", async () => {
      await transferOwnership(this.presale, this.owner, receiver)
      const newOwner = await this.presale.owner.call()
      assert.equal(receiver, newOwner)
    })
    // it("should not be transferable by non-owner", async () => {
    //   await expectInvalidOpcode(
    //     transferOwnership(this.presale, hacker_1, hacker_2)
    //   )
    //   const newOwner = await this.presale.owner.call()
    //   return assert.equal(this.owner, newOwner)
    // })
  })

  describe("Tokens", async () => {
    it("all should initially be in owners account", async () => {
      await expect(
        this.token.balanceOf(investor)
      ).to.eventually.be.a.bignumber.equal(await this.token.totalSupply())
    })
    it("should be able to transfer between accounts", async () => {
      await expect(this.token.transfer(receiver, transfer)).to.eventually.be
        .fulfilled
    })
    it("transfer exceed total amount should be rejected", async () => {
      await expect(
        this.token.transfer(
          receiver,
          new BN((await this.token.totalSupply()) + 1)
        )
      ).to.eventually.be.rejected
    })
    it("transfer to or from blacklisted address will be rejected", async () => {
      await expect(this.token.setAddressAsBlacklisted(hacker_1)).to.eventually
        .be.fulfilled
      await expect(this.token.transfer(hacker_1, transfer)).to.eventually.be
        .rejected
    })
  })

  // describe("Pre-Sale", async () => {
  //   it("ICO starts", async () => {
  //     await expect(
  //       this.presale.startICO(
  //         1630376078,
  //         smallInvestment,
  //         hugeInvestment,
  //         await this.token.totalSupply(),
  //         softCap,
  //         hardCap
  //       )
  //     ).to.eventually.be.fulfilled

  //     txn_obj = {
  //       from: investor,
  //       to: this.presale.address,
  //       value: investment,
  //       gas: 1000000,
  //     }
  //     txn = await expect(makeTransaction(txn_obj)).to.eventually.be.fulfilled

  //     params = { from: investor, gas: 1000000, value: investment }
  //     txn_2 = await expect(this.presale.buyTokens(investor, params)).to
  //       .eventually.be.fulfilled
  //   })
  // })
})