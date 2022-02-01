import React, { Component, useState } from "react";
import { is721 } from "../helpers/helpers";
import dapps from "../helpers/dapps";
import { ERC20ABI } from "../helpers/ABI";
import Icon from "@mdi/react";
import {
  mdiCancel,
  mdiCheckboxBlankCircleOutline,
  mdiCheckboxMarkedCircleOutline,
} from "@mdi/js";

import { toast } from "react-toastify";
import { getExplorerFromChainId, linkToAddress, linkToTransaction } from "../helpers/explorer";
import { shorten } from "../helpers/transaction";

class allowance extends Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.setRevokeClick = this.setRevokeClick.bind(this);
    this.dappURL = this.dappURL.bind(this);
    this.initRevoke = this.initRevoke.bind(this);
    this.revokeSuccess = this.revokeSuccess.bind(this);
    this.revokeFailed = this.revokeFailed.bind(this);
  }

  dappURL() {
    const dappsKeys = Object.keys(dapps);
    let url = "";
    for (let key of dappsKeys) {
      if (this.props.tx.contractName.toLowerCase().includes(key)) {
        url = dapps[key];
      }
    }
    return url;
  }

  setRevokeClick() {
    // set the contract and make an approve transaction with a zero allowance
    const { web3 } = this.props;
    const contract = new web3.eth.Contract(ERC20ABI, this.props.tx.token);
    is721(contract, this.props.tx.allowanceUnEdited).then((result) => {
      if (result) {
        //revoke erc721 by nulling the address
        throw new Error("ERC 721 is not supported yet!")
        // this.initRevoke();
        // contract.methods
        //   .approve(0, this.props.tx.allowanceUnEdited)
        //   .send({ from: this.props.account })
        //   .then(this.revokeSuccess)
        //   .catch(this.revokeFailed);
      } else {
        // revoke erc20 by nulling approval amount
        this.initRevoke();
        contract.methods
          .approve(this.props.tx.contract, 0)
          .send({ from: this.props.account })
          .then(this.revokeSuccess)
          .catch(this.revokeFailed);
      }
    });
  }

  initRevoke() {
    this.props.onStatusChange("pending", this.props.tx);
  }

  revokeSuccess(receipt) {
    toast.success("Successfully Revoked!");
    console.log(receipt);
    this.props.onStatusChange("success", this.props.tx);
  }

  revokeFailed(err) {
    toast.error("Could Not Revoke Allowance!");
    console.error(err);
    this.props.onStatusChange("none", this.props.tx);
  }

  renderRevokeButton() {
    if (this.props.status === "pending") {
      return (
        <button className="icon-btn">
          <Icon path={mdiCheckboxBlankCircleOutline} size={1} color="#dbdbdb" />
        </button>
      );
    } else if (this.props.status === "success") {
      return (
        <button className="icon-btn">
          <Icon
            path={mdiCheckboxMarkedCircleOutline}
            size={1}
            color="#78e900"
          />
        </button>
      );
    } else
      return (
        <button
          className="icon-btn"
          name="revoke"
          onClick={() => {
            this.setRevokeClick();
          }}
        >
          <Icon path={mdiCancel} size={1} color="#e90000" />
        </button>
      );
  }

  render() {
    return (
      <tr key={"allowance-nr-" + this.props.tx.hash}>
        <td className="grid-items">
          {new Date(parseInt(this.props.tx.timestamp) * 1000).toLocaleString()}
        </td>
        <td className="grid-items">
          <a href={linkToAddress(this.props.tx.token)} target="_blank" rel='noreferrer'>
            {this.props.tx.tokenName || shorten(this.props.tx.token)}
          </a>
        </td>
        <td className="grid-items">
          <a href={linkToAddress(this.props.tx.contract)} target="_blank" rel='noreferrer'>
            {shorten(this.props.tx.contract)}
          </a>
        </td>
        <td>
        <a href={linkToTransaction(this.props.tx.hash)} target="_blank" rel='noreferrer'>
            {shorten(this.props.tx.hash)}
          </a></td>
        <td className="grid-items">{this.props.tx.allowanceString }</td>
        <td className="grid-items">{this.renderRevokeButton()}</td>
      </tr>
    );
  }
}

export default allowance;
