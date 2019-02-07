import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getCurrentProfile } from "../../actions/profileActions";
import Spinner from '../common/Spinner';

class Dashboard extends Component {

    componentDidMount() {
        this.props.getCurrentProfile();
    }

    render() {
        const { user } = this.props.auth;
        const { profile, loading } = this.props.profile;

        let dashboardContent;

        if(profile === null || loading) {
            dashboardContent = <Spinner />
        }
        else {
            if (Object.keys(profile).length > 0) {
                dashboardContent = <h4>TODO: DISPLAY PROFILE</h4>;
            }
            else {
                // User is logged in but has no profile
                dashboardContent = (
                    <div>
                        <p className="lead text-muted"> Welcome {user.name}</p>
                        <h5>You have not setup a profile, please add some info.</h5>
                        <Link to="/create-profile" className="btn btn-lg btn-info">
                            Create Profile
                        </Link>
                    </div>
                );
            }
        }


        return (
            <div className="dashboard">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="display-4">
                                Dashboard
                                {dashboardContent}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth
});

export default connect(mapStateToProps, { getCurrentProfile })(Dashboard);