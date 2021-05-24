const { task } = require("hardhat/config");
const factoryArtifact = require("Swapper-staking-rewards-distribution-contracts/build/SwapperERC20StakingRewardsDistributionFactory.json");
task( "deploy", "Deploys the whole contracts suite and verifies source code on Etherscan" )


    .addParam("tokenRegistryAddress", "The token registry address")
    .addParam( "tokenRegistryListId", "The token registry list id to be used to validate tokens" )
    .addParam("factoryAddress", "The address of swapper's pairs factory")
    .addFlag( "verify",  "Additional (and optional) Etherscan contracts verification")
    .setAction(async (taskArguments, hre) => {
        const {
            tokenRegistryAddress,
            tokenRegistryListId,
            factoryAddress,
            verify
        } = taskArguments;

        await hre.run("clean");
        await hre.run("compile");

        const DefaultRewardTokensValidator = hre.artifacts.require(
            "DefaultRewardTokensValidator"
        );
        const rewardTokensValidator = await DefaultRewardTokensValidator.new(
            tokenRegistryAddress,
            tokenRegistryListId
        );
        if(verify) {
            await hre.run("verify", {
                address: rewardTokensValidator.address,
                constructorArguments: [tokenRegistryAddress, tokenRegistryListId],
            });
        }

        const DefaultStakableTokenValidator = hre.artifacts.require(
            "DefaultStakableTokenValidator"
        );
        const stakableTokenValidator = await DefaultStakableTokenValidator.new(
            tokenRegistryAddress,
            tokenRegistryListId,
            factoryAddress
        );
        if(verify) {
            await hre.run("verify", {
                address: stakableTokenValidator.address,
                constructorArguments: [
                    tokenRegistryAddress,
                    tokenRegistryListId,
                    factoryAddress,
                ],
            });
        }

        const swapperERC20StakingRewardsDistributionFactory = hre.artifacts.require(
            "SwapperERC20StakingRewardsDistributionFactory"
        );
        const factory = await swapperERC20StakingRewardsDistributionFactory.new(
            rewardTokensValidator.address,
            stakableTokenValidator.address
        );
        if(verify) {
            await hre.run("verify", {
                address: factory.address,
                constructorArguments: [
                    rewardTokensValidator.address,
                    stakableTokenValidator.address,
                ],
            });
        }

        console.log(`--------------------------------------------------------------------------`);
        console.log( `reward tokens validator deployed at address ${rewardTokensValidator.address}` );
        console.log(`--------------------------------------------------------------------------`);

        console.log(`--------------------------------------------------------------------------`);
        console.log( `stakable token validator deployed at address ${stakableTokenValidator.address}` );
        console.log(`--------------------------------------------------------------------------`);

        console.log(`--------------------------------------------------------------------------`);
        console.log(`factory deployed at address ${factory.address}`);
        console.log(`--------------------------------------------------------------------------`);
        console.log(`DONE : ALL SOURCE IS VERIFIED`);
    });
