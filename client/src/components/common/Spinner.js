import React, {Component} from 'react';
import spinner from './spinner.gif';

class Spinner extends Component {
    render() {
        return (
            <div>
                <img
                    src={spinner}
                    alt="Loading..."
                    style={{ width: '200px', margin: 'auto', display: 'block' }}
                />
            </div>
        );
    }
}

export default Spinner;