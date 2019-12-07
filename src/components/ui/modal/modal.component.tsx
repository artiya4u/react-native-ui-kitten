/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  Dimensions,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {
  ModalService,
  StyleType,
} from '@kitten/theme';
import {
  MeasureNode,
  MeasureNodeProps,
  MeasuringElementProps,
  MeasureResult,
} from '../popover/measure.component';
import { Size } from '../popover/type';
import { ModalPresentingBased } from '../support/typings';

const initialWindowSize: Size = Dimensions.get('screen');
const TAG_CHILD: string = 'Modal';
const initialContentSize: Size = { width: 0, height: 0 };
export const baseModalTestId: string = '@modal/base';

type ChildElement = React.ReactElement;
type ChildrenProp = ChildElement | ChildElement[];

interface ComponentProps {
  visible: boolean;
  children: ChildrenProp;
  backdropStyle?: StyleProp<ViewStyle>;
}

export type ModalProps = ViewProps & ComponentProps & ModalPresentingBased;
export type ModalElement = React.ReactElement<ModalProps>;

/**
 * `Modal` component is a wrapper than presents content above an enclosing view.
 *
 * @extends React.Component
 *
 * @property {boolean} visible - Determines whether component is visible. By default is false.
 *
 * @property {ReactElement | ReactElement[]} children - Determines component's children.
 *
 * @property {boolean} allowBackdrop - Determines whether user can tap on back-drop.
 * Default is `false`.
 *
 * @property {StyleProp<ViewStyle>} backdropStyle - Determines the style of backdrop.
 *
 * @property {() => void} onBackdropPress - Determines component's behavior when the user is
 * tapping on back-drop.
 *
 * @property {ViewProps} ...ViewProps - Any props applied to View component.
 *
 * @overview-example ModalSimpleUsage
 *
 * @overview-example ModalWithBackdrop
 */
export class Modal extends React.Component<ModalProps> {

  static defaultProps: Partial<ModalProps> = {
    allowBackdrop: false,
    onBackdropPress: () => null,
  };

  private contentSize: Size = initialContentSize;
  private id: string = '';

  public componentDidUpdate(prevProps: ModalProps): void {
    if (prevProps.visible !== this.props.visible) {
      this.handleVisibility(this.props);
    } else if (prevProps.visible && this.props.visible) {
      const element: React.ReactElement = this.renderModal();
      ModalService.update(this.id, element.props.children);
    }
  }

  private handleVisibility = (props: ModalProps): void => {
    const { allowBackdrop, onBackdropPress } = this.props;

    if (props.visible) {
      const element: React.ReactElement = this.renderModal();
      this.id = ModalService.show(element, { allowBackdrop, onBackdropPress });
    } else {
      ModalService.hide(this.id);
      this.id = '';
    }
  };

  private getAbsoluteRelatedStyle = (): StyleType => {
    const windowSize: Size = Dimensions.get('window');

    return {
      top: (windowSize.height - this.contentSize.height) / 2,
      left: (windowSize.width - this.contentSize.width) / 2,
    };
  };

  private onMeasure = (result: MeasureResult): void => {
    this.contentSize = result[TAG_CHILD].size;
  };

  private renderBaseModal = (): React.ReactElement<ViewProps> => {
    const { style, children, ...restProps } = this.props;
    const absoluteRelatedStyle: StyleType = this.getAbsoluteRelatedStyle();
    const measuringProps: MeasuringElementProps = { tag: TAG_CHILD };

    return (
      <View
        {...restProps}
        {...measuringProps}
        testID={baseModalTestId}
        key={TAG_CHILD}
        style={[styles.container, absoluteRelatedStyle, style]}>
        {children}
      </View>
    );
  };

  private renderModal = (): React.ReactElement => {
    const { backdropStyle } = this.props;
    const modal: React.ReactElement<ViewProps> = this.renderBaseModal();

    return backdropStyle ? (
      <React.Fragment>
        <View
          pointerEvents='box-none'
          style={[styles.backdrop, backdropStyle]}/>
        {modal}
      </React.Fragment>
    ) : modal;
  };

  private renderMeasureNode = (): React.ReactElement<MeasureNodeProps> => {
    const modal: React.ReactElement = this.renderBaseModal();
    const measureStyledModal: React.ReactElement = React.cloneElement(modal, {
      style: [modal.props.style, styles.hiddenModal],
      key: TAG_CHILD,
      pointerEvents: 'none',
    });

    return (
      <MeasureNode onResult={this.onMeasure}>
        {[measureStyledModal]}
      </MeasureNode>
    );
  };

  public render(): React.ReactNode {
    return this.renderMeasureNode();
  }

  public componentWillUnmount(): void {
    ModalService.hide(this.id);
    this.id = '';
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  backdrop: {
    position: 'absolute',
    width: initialWindowSize.width,
    height: initialWindowSize.height,
  },
  hiddenModal: {
    opacity: 0,
  },
});
