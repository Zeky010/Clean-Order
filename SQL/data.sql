INSERT INTO `gestion-ot`.region (CODIGO,NOMBRE) VALUES
	 (9,' REGIÓN DE LA ARAUCANÍA'),
	 (13,' REGIÓN METROPOLITANA DE SANTIAGO');
	 
INSERT INTO `gestion-ot`.comuna (CODIGO,NOMBRE,FK_CODIGO_REGION) VALUES
	 (9101,'Temuco',9),
	 (9102,'Carahue',9),
	 (9103,'Cunco',9),
	 (13101,'Santiago',13),
	 (13102,'Cerrillos',13),
	 (13103,'Cerro Navia',13);

INSERT INTO `gestion-ot`.rol (NOMBRE) VALUES
	 ('ADMIN');
	 
INSERT INTO `gestion-ot`.usuario (CORREO,PASSWORD,ACTIVO,FK_ID_ROL,FK_RUT_EMPLEADO) VALUES
	 ('pass@pass.cl','$2a$12$NnJUKkon0EmXbDDeHBQ0C.G5wPlri83i8.LEGgh6x8joH.Y43x6Fm',1,1,NULL);
