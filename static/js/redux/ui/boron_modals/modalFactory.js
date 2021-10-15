import React from 'react';
import createReactClass from 'create-react-class';
import transitionEvents from 'domkit/transitionEvents';
import appendVendorPrefix from 'domkit/appendVendorPrefix';

function modalFactory(animation) {
  return createReactClass({
    getDefaultProps() {
      return {
        className: '',
        onShow() {},
        onHide() {},
        animation,
        keyboard: true,
        backdrop: true,
        closeOnClick: true,
        modalStyle: {},
        backdropStyle: {},
        contentStyle: {},
      };
    },

    getInitialState() {
      return {
        willHidden: false,
        hidden: true,
      };
    },

    hasHidden() {
      return this.state.hidden;
    },

    addTransitionListener(node, handle) {
      if (node) {
        var endListener = function (e) {
          if (e && e.target !== node) {
            return;
          }
          transitionEvents.removeEndEventListener(node, endListener);
          handle();
        };
        transitionEvents.addEndEventListener(node, endListener);
      }
    },

    handleBackdropClick() {
      if (this.props.closeOnClick) {
        this.hide();
      }
    },

    render() {
      const hidden = this.hasHidden();
      if (hidden) return null;

      const willHidden = this.state.willHidden;
      const animation = this.props.animation;
      const modalStyle = animation.getModalStyle(willHidden);
      const backdropStyle = animation.getBackdropStyle(willHidden);
      const contentStyle = animation.getContentStyle(willHidden);
      const ref = animation.getRef(willHidden);
      const sharp = animation.getSharp && animation.getSharp(willHidden);

            // Apply custom style properties
      if (this.props.modalStyle) {
        const prefixedModalStyle = appendVendorPrefix(this.props.modalStyle);
        for (var style in prefixedModalStyle) {
          modalStyle[style] = prefixedModalStyle[style];
        }
      }

      if (this.props.backdropStyle) {
        const prefixedBackdropStyle = appendVendorPrefix(this.props.backdropStyle);
        for (var style in prefixedBackdropStyle) {
          backdropStyle[style] = prefixedBackdropStyle[style];
        }
      }

      if (this.props.contentStyle) {
        const prefixedContentStyle = appendVendorPrefix(this.props.contentStyle);
        for (var style in prefixedContentStyle) {
          contentStyle[style] = prefixedContentStyle[style];
        }
      }

      const backdrop = this.props.backdrop ? React.createElement('div', { style: backdropStyle, onClick: this.props.closeOnClick ? this.handleBackdropClick : null }) : undefined;

      if (willHidden) {
        const node = this.refs[ref];
        this.addTransitionListener(node, this.leave);
      }

      return (React.createElement('span', null,
                React.createElement('div', { ref: 'modal', style: modalStyle, className: this.props.className },
                    sharp,
                    React.createElement('div', { ref: 'content', tabIndex: '-1', style: contentStyle },
                        this.props.children,
                    ),
                ),
                backdrop,
             ))
            ;
    },

    leave() {
      this.setState({
        hidden: true,
      });
      this.props.onHide();
    },

    enter() {
      this.props.onShow();
    },

    show() {
      if (!this.hasHidden()) return;

      this.setState({
        willHidden: false,
        hidden: false,
      });

      setTimeout(() => {
        const ref = this.props.animation.getRef();
        const node = this.refs[ref];
        this.addTransitionListener(node, this.enter);
      }, 0);
    },

    hide() {
      if (this.hasHidden()) return;

      this.setState({
        willHidden: true,
      });
    },

    toggle() {
      if (this.hasHidden()) { this.show(); } else { this.hide(); }
    },

    listenKeyboard(event) {
      if (this.props.keyboard &&
                    (event.key === 'Escape' ||
                     event.keyCode === 27)) {
        this.hide();
      }
    },

    componentDidMount() {
      window.addEventListener('keydown', this.listenKeyboard, true);
    },

    componentWillUnmount() {
      window.removeEventListener('keydown', this.listenKeyboard, true);
    },
  });
}

export default modalFactory;
