// src/components/LikeHandler.js
import React, {useEffect, useState} from 'react';
import {MdOutlineFavorite, MdOutlineFavoriteBorder} from "react-icons/md";
import {toast} from 'react-toastify';
import api from "../utils/api";
import {useAuth} from "../../context/AuthContext";

const LikeHandler = ({itemId}) => {
    const [liked, setLiked] = useState(false);
    const [likeId, setLikeId] = useState(null);
    const {user} = useAuth();

    useEffect(() => {
        const fetchLikeStatus = async () => {
            if (user) {
                try {
                    const response = await api.get(`/likes?filters[item][id][$eq]=${itemId}&filters[user_liked_id][$eq]=${user.user_id}`);
                    if (response.data && response.data.length > 0) {
                        setLiked(true);
                        setLikeId(response.data[0].id);
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
            toast.info('You must be logged in to like item');
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
                        user_liked_id: user.user_id,
                        user: user.id,
                        item: itemId,
                        user_favorite_item: {
                            user_liked_id: user.user_id,
                            item: itemId,
                        }
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
        <div className="position-absolute top-0 end-0 m-3">
            {liked ? (
                <MdOutlineFavorite
                    size={35}
                    style={{borderColor: '#000', fill: '#fd3040', cursor: 'pointer'}}
                    onClick={handleLike}
                />
            ) : (
                <MdOutlineFavoriteBorder
                    size={35}
                    style={{borderColor: '#000', cursor: 'pointer'}}
                    onClick={handleLike}
                />
            )}
        </div>
    );
};

export default LikeHandler;
