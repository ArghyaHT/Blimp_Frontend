import React, { useEffect, useState } from "react";
import style from "./WorkCard.module.css";
import { useGlobalContext } from "../../context/GlobalContext";
import aboutImageOne from "../../assets/aboutImageOne.jpg";
import aboutImageTwo from "../../assets/aboutImageTwo.jpg";

const WorkCard = ({ dir, title, description }) => {
  const { mobileWidth } = useGlobalContext();

  return (
    <div className={style.missionCardWrapper}>
      {mobileWidth ? (
        <>
          <img
            src={dir === "left" ? aboutImageOne : aboutImageTwo}
            alt={title}
          />
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </>
      ) : dir === "left" ? (
        <>
          <img
            src={aboutImageOne}
            alt={title}
          />
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </>
      ) : (
        <>
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <img
            src={aboutImageTwo}
            alt={title}
          />
        </>
      )}
    </div>
  );
};

export default WorkCard;
