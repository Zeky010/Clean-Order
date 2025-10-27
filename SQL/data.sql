
INSERT INTO `gestion-ot`.rol (NOMBRE) VALUES
	 ('ADMIN');
	 
INSERT INTO `gestion-ot`.usuario (CORREO,PASSWORD,ACTIVO,FK_ID_ROL,FK_RUT_EMPLEADO) VALUES
	 ('pass@pass.cl','$2a$12$NnJUKkon0EmXbDDeHBQ0C.G5wPlri83i8.LEGgh6x8joH.Y43x6Fm',1,1,NULL);

INSERT INTO `gestion-ot`.orden_estado (NOMBRE) VALUES
	 ('AGENDADO'),
	 ('EN PROCESO'),
	 ('REALIZADO'),
	 ('SUSPENDIDO');
	 
INSERT INTO `gestion-ot`.tipo_carga (NOMBRE_CARGA) VALUES
	 ('RILES'),
	 ('AGUAS GRASAS'),
	 ('AGUAS SERVIDAS'),
	 ('RESPEL');
