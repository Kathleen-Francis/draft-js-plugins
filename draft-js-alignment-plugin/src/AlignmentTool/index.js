/* eslint-disable react/no-array-index-key */
import React from 'react';
import {
  AlignBlockDefaultButton,
  AlignBlockCenterButton,
} from 'draft-js-buttons';
import styles from '../alignmentToolStyles.css';
import buttonStyles from '../buttonStyles.css';

const getRelativeParent = (element) => {
  if (!element) {
    return null;
  }

  const position = window.getComputedStyle(element).getPropertyValue('position');
  if (position !== 'static') {
    return element;
  }

  return getRelativeParent(element.parentElement);
};

export default class AlignmentTool extends React.Component {

  state = {
    position: {},
    alignment: null,
    width: 50,
  }

  componentWillMount() {
    this.props.store.subscribeToItem('visibleBlock', this.onVisibilityChanged);
    this.props.store.subscribeToItem('alignment', this.onAlignmentChange);
    this.props.store.subscribeToItem('width', this.onWidthChange);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('visibleBlock', this.onVisibilityChanged);
    this.props.store.unsubscribeFromItem('alignment', this.onAlignmentChange);
    this.props.store.unsubscribeFromItem('width', this.onWidthChange);
  }

  onVisibilityChanged = (visibleBlock) => {
    setTimeout(() => {
      let position;
      const boundingRect = this.props.store.getItem('boundingRect');
      if (visibleBlock) {
        const relativeParent = getRelativeParent(this.toolbar.parentElement);
        const toolbarHeight = this.toolbar.clientHeight;
        const relativeRect = relativeParent ? relativeParent.getBoundingClientRect() : document.body.getBoundingClientRect();
        position = {
          top: (boundingRect.top - relativeRect.top) - toolbarHeight,
          left: (boundingRect.left - relativeRect.left) + (boundingRect.width / 2),
          transform: 'translate(-50%) scale(1)',
          transition: 'transform 0.15s cubic-bezier(.3,1.2,.2,1)',
        };
      } else {
        position = { transform: 'translate(-50%) scale(0)' };
      }
      const alignment = this.props.store.getItem('alignment') || 'default';
      const width = this.props.store.getItem('width') || 50;
      this.setState({
        alignment,
        position,
        width,
      });
    }, 0);
  }

  onAlignmentChange = (alignment) => {
    this.setState({
      alignment,
    });
  }

  onWidthChange = (width) => {
    this.setState({
      width,
    });
  }

  onSliderChange = (event) => {
    event.preventDefault();
    this.props.store.getItem('setWidth')({ width: event.target.value });
  }

  render() {
    const defaultButtons = [
      AlignBlockDefaultButton,
      AlignBlockCenterButton,
    ];
    return (
      <div
        className={styles.alignmentTool}
        style={this.state.position}
        ref={(toolbar) => { this.toolbar = toolbar; }}
      >
        {defaultButtons.map((Button, index) => (
          <Button
            key={index}
            alignment={this.state.alignment}
            setAlignment={this.props.store.getItem('setAlignment')}
            theme={buttonStyles}
          />
        ))}
        <label htmlFor="widthInput">Width:</label>
        <input
          id="widthInput"
          type="range" min="0"
          max="100"
          onChange={this.onSliderChange}
        />
      </div>
    );
  }
}
