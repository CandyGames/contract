pragma solidity 0.4.15;

import "./Ownable.sol";
import "./SafeMath.sol";


contract TotumAllocation is Ownable {

    using SafeMath for uint256;

    address public bountyAddress;

    address public teamAddress;

    address public preICOAddress;

    address public icoAddress;

    address public icoAddress1;

    function TotumAllocation(
        address _bountyAddress, //5%
        address _teamAddress, //7%
        address _preICOAddress,
        address _icoAddress, //50%
        address _icoAddress1 //50%
    ) {
        require((address(_bountyAddress) != 0x0) && (address(_teamAddress) != 0x0));
        require((address(_preICOAddress) != 0x0) && (address(_icoAddress) != 0x0) && (address(_icoAddress1) != 0x0));

        bountyAddress = _bountyAddress;
        teamAddress = _teamAddress;
        preICOAddress = _preICOAddress;
        icoAddress = _icoAddress;
        icoAddress1 = _icoAddress1;
    }

}