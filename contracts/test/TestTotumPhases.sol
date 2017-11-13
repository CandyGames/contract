pragma solidity 0.4.15;


import "../TotumPhases.sol";


contract TestTotumPhases is TotumPhases {
    function TestTotumPhases(
        address _totum,
        uint256 _minInvest,
        uint256 _tokenPrice, //0.0033 ethers
        uint256 _preIcoMaxCap,
        uint256 _preIcoSince,
        uint256 _preIcoTill,
        uint256 _icoMinCap,
        uint256 _icoMaxCap,
        uint256 _icoSince,
        uint256 _icoTill
    ) TotumPhases(
        _totum,
        _minInvest,
        _tokenPrice, //0.0033 ethers
        _preIcoMaxCap,
        _preIcoSince,
        _preIcoTill,
        _icoMinCap,
        _icoMaxCap,
        _icoSince,
        _icoTill
    ) {

    }

    function checkGetVolumeBasedBonusAmount(uint256 _value, uint256 _amount) public returns (uint256) {
        return super.getVolumeBasedBonusAmount(_value, _amount);
    }

    function checkGetTokensAmount(uint256 _value, uint8 _currentPhase) public returns (uint256) {
        return super.getTokensAmount(_value, _currentPhase);
    }

}