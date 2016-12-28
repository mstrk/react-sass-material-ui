import React, { Component } from 'react';
import classnames from 'classnames';
import DataRow from './DataRow';
import SvgIcon from '../SvgIcon';

class DataTable extends Component {
  state = {
    selectedRows: [],
    ascending: false
  }

  componentWillMount() {
    const {
      data = [],
      disabledRows = [],
      maxSelected,
      excludeKeys = [],
      sortableKeys = [],
      headerLabels = []
    } = this.props;

    let { disableSelectAll } = this.props;

    if (maxSelected) disableSelectAll = true;

    this.setState({
      data,
      disabledRows,
      disableSelectAll,
      maxSelected,
      excludeKeys,
      sortableKeys,
      headerLabels
    });
  }

  componentWillReceiveProps(nextProps) {
    const {
      data = [],
      disabledRows = [],
      maxSelected,
      excludeKeys = [],
      sortableKeys = [],
      headerLabels = []
    } = nextProps;

    let { disableSelectAll } = nextProps;

    if (maxSelected) disableSelectAll = true;

    this.setState({
      data,
      disabledRows,
      disableSelectAll,
      maxSelected,
      excludeKeys,
      sortableKeys,
      headerLabels
    });
  }

  onSelectClick = (index) => {
    const { maxSelected, data } = this.state;
    let { selectedRows } = this.state;
    const item = data[index];

    if (this.isDisabled(item)) return;

    if (this.isSelected(item)) {
      selectedRows.splice(selectedRows.indexOf(item), 1);
    } else if (maxSelected === 1) {
      selectedRows = [item];
    } else if (selectedRows.length >= maxSelected) {
      return;
    } else {
      selectedRows.push(item);
    }

    this.setState({ selectedRows });
    this.onChange(selectedRows);
  }

  onSelectAllRowsClick = () => {
    const { selectedRows, disabledRows, disableSelectAll, data } = this.state;
    const notAllSelected = selectedRows.length !== (data.length - disabledRows.length);
    let newSelectedRows = [];

    if (disableSelectAll) return;

    if (notAllSelected) {
      newSelectedRows = [].concat(data)
        .filter((item) => (disabledRows.indexOf(item) === -1));
    }
    
    this.setState({ selectedRows: newSelectedRows });
    this.onChange(newSelectedRows);
  }

  onChange(data) {
    if (typeof this.props.onSelectedChange === 'function') {
      this.props.onSelectedChange(data);
    }
  }

  sort = (prop, headerIndex) => {
    if (!this.isSortable(prop)) return;

    const { data, ascending } = this.state;
    let sorted;

    if (ascending) {
      sorted = data.sort((a, b) => (a[prop] < b[prop]));
    } else {
      sorted = data.sort((a, b) => (a[prop] > b[prop]));
    }

    this.setState({
      data: sorted,
      ascending: !ascending,
      sortActive: headerIndex
    });
  }

  isSortable(prop) {
    return this.state.sortableKeys.indexOf(prop) !== -1;
  }

  isSelected(item) {
    return this.state.selectedRows.indexOf(item) !== -1;
  }

  isDisabled(item) {
    return this.state.disabledRows.indexOf(item) !== -1;
  }

  renderHeaders() {
    const {
      data,
      excludeKeys,
      sortActive,
      ascending,
      headerLabels
    } = this.state;
    
    const keys = Object.keys(data[0]).filter((key) => (excludeKeys.indexOf(key)) === -1);

    return keys.map((prop, i) => (
      <th
        className={
          classnames(
            {
              'is-sortable': this.isSortable(prop),
              'is-sortable-active': sortActive === i
            }
          )
        }
        key={i}
        onClick={this.sort.bind(null, prop, i)}
      >
        {sortActive === i && <SvgIcon icon={ascending ? 'arrow-up' : 'arrow-down'} />}
        {headerLabels[i] || prop}
      </th>
    ));
  }

  renderRows(color) {
    return this.state.data.map((item, key) => (
      <DataRow
        key={key}
        selected={this.isSelected(item)}
        disabled={this.isDisabled(item)}
        checkboxColor={color}
        onSelectClick={this.onSelectClick.bind(null, key)}
      >
        {this.renderCells(item)}
      </DataRow>
    ));
  }

  renderCells(item) {
    const { excludeKeys } = this.state;

    return Object.keys(item)
    .map((prop, i) => (
      excludeKeys.indexOf(prop) === -1 ?
      <td key={i}>{item[prop]}</td>
      : null
    ));
  }

  renderSelectAllRows(color) {
    const { data, selectedRows, disabledRows, disableSelectAll } = this.state;
    const isAllSelected = selectedRows.length === (data.length - disabledRows.length);

    return (
      <th>
        <span
          className={
            classnames(
              {
                [`is-all-selected-${color}`]: !disableSelectAll,
                'is-all-selected': isAllSelected && !disableSelectAll,
                'checkbox-is-disabled': disableSelectAll
              }
            )
          }
          onClick={this.onSelectAllRowsClick}
        >
          <SvgIcon
            icon={isAllSelected && !disableSelectAll ? 'checkbox-marked' : 'checkbox-blank-outline'}
          />
        </span>
      </th>
    );
  }

  render() {
    const {
      withHeader = true,
      withFooter = false,
      checkboxColor = 'accent' 
    } = this.props;

    return (
      <table className='data-table'>
        {withHeader &&
          <thead>
            <tr>
              {this.renderSelectAllRows(checkboxColor)}
              {this.renderHeaders()}
            </tr>
          </thead>
        }

        {withFooter &&
          <tfoot>
            <tr>
              {this.renderSelectAllRows(checkboxColor)}
              {this.renderHeaders()}
            </tr>
          </tfoot>
        }

        <tbody>
          {this.renderRows(checkboxColor)}
        </tbody>
      </table>
    );
  }
}

export default DataTable;
