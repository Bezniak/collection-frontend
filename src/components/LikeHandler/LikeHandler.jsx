import React, {useEffect, useState} from 'react';
import {MdOutlineFavorite, MdOutlineFavoriteBorder} from "react-icons/md";
import {toast} from 'react-toastify';
import api from "../utils/api";
import {useAuth} from "../../context/AuthContext";
import './LikeHandler.css';
import {useTranslation} from "react-i18next";

const LikeHandler = ({itemId}) => {
    const {t} = useTranslation();
    const [liked, setLiked] = useState(false);
    const [likeId, setLikeId] = useState(null);
    const {user} = useAuth();

    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (user) {
                try {
                    const response = await api.get(
                        `/likes?filters[item][id][$eq]=${itemId}&filters[user][id][$eq]=${user.id}`);
                    if (response?.data?.length > 0) {
                        setLiked(true);
                        setLikeId(response?.data[0]?.id);
                    } else {
                        setLiked(false);
                        setLikeId(null);
                    }
                } catch (error) {
                    console.error('Error fetching like status:', error);
                }
            }
        };

        fetchLikeStatus();
    }, [itemId, user]);

    const handleLike = async () => {
        if (!user) {
            toast.info(`${t("like_rule")}`);
            return;
        }

        if (liked) {
            if (!likeId) {
                console.error('Error: likeId is not defined');
                return;
            }
            try {
                await api.delete(`/likes/${likeId}`);
                setLiked(false);
                setLikeId(null);
            } catch (error) {
                console.error('Error deleting like:', error.response ? error.response.data : error.message);
            }
        } else {
            try {
                const response = await api.post('/likes', {
                    data: {
                        user: user.id,
                        item: itemId,
                    },
                });
                setLiked(true);
                setLikeId(response.data.id);
            } catch (error) {
                console.error('Error adding like:', error.response ? error.response.data : error.message);
            }
        }
    };

    return (
        <div className="like-handler position-absolute top-0 end-0 m-3">
            {liked ? (
                <MdOutlineFavorite
                    size={35}
                    className="like-icon"
                    onClick={handleLike}
                    style={{borderColor: '#000', fill: '#fd3040', cursor: 'pointer'}}
                />
            ) : (
                <MdOutlineFavoriteBorder
                    size={35}
                    className="like-icon"
                    style={{borderColor: '#000', cursor: 'pointer'}}
                    onClick={handleLike}
                />
            )}
        </div>
    );
};

export default LikeHandler;
