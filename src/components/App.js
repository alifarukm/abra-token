import React, { Component } from 'react';
import Web3 from 'web3';
import Abra from '../abis/Abra.json';
import EthSwap from '../abis/EthSwap.json';
import Navbar from './Navbar';
import Main from './Main';
import './App.css';
import config from '../config';
import logo from '../abra-logo.png';

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ ethBalance });

    // Load Abra
    const token = new web3.eth.Contract(Abra.abi, config.addresses.ropstenAbra);
    this.setState({ token });
    let tokenBalance = await token.methods.balanceOf(this.state.account).call();
    this.setState({ tokenBalance: tokenBalance.toString() });
    const ethSwap = new web3.eth.Contract(
      EthSwap.abi,
      config.addresses.ropstenEthSwap
    );
    this.setState({ ethSwap });

    this.setState({ loading: false });
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true });
    this.state.ethSwap.methods
      .buyTokens()
      .send({ value: etherAmount, from: this.state.account })
      .on('transactionHash', (hash) => {
        this.setState({ loading: false });
      });
  };

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true });
    this.state.token.methods
      .approve(this.state.ethSwap._address, tokenAmount)
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.state.ethSwap.methods
          .sellTokens(tokenAmount)
          .send({ from: this.state.account })
          .on('transactionHash', (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
    };
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p id='loader' className='text-center'>
          Loading...
        </p>
      );
    } else {
      content = (
        <Main
          ethBalance={this.state.ethBalance}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens}
          sellTokens={this.sellTokens}
        />
      );
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className='container-fluid mt-5'>
          <div class='d-flex justify-content-around'>
            {' '}
            <a
              href='https://cv.alikucukmumcu.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              <img src={logo} className='App-logo' alt='logo' width='600px' />
            </a>
            <div class='col-sm'>
              <div className='content mr-auto ml-auto'>
                <a
                  href='https://cv.alikucukmumcu.com'
                  target='_blank'
                  rel='noopener noreferrer'
                ></a>
                {content}
              </div>
            </div>
            <a
              href='https://cv.alikucukmumcu.com'
              target='_blank'
              rel='noopener noreferrer'
            >
              <img src={logo} className='App-logo' alt='logo' width='600px' />
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
